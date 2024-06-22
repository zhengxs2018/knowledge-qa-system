/* eslint-disable @typescript-eslint/ban-types */
import { onUnexpectedError } from './errors';
import { Disposable, type IDisposable, toDisposable } from './lifecycle';

/**
 * An event with zero or one parameters that can be subscribed to. The event is a function itself.
 */
export interface Event<T> {
  (
    listener: (e: T) => any,
    thisArgs?: any,
    disposables?: IDisposable[],
  ): IDisposable;
}

export namespace Event {
  export const None: Event<any> = () => Disposable.None;
}

let id = 0;
class UniqueContainer<T> {
  public id = id++;
  constructor(public readonly value: T) {}
}

const compactionThreshold = 2;

type ListenerContainer<T> = UniqueContainer<(data: T) => void>;
type ListenerOrListeners<T> =
  | (ListenerContainer<T> | undefined)[]
  | ListenerContainer<T>;

export interface EmitterOptions {
  /**
   * Optional function that's called *before* the very first listener is added
   */
  onWillAddFirstListener?: Function;
  /**
   * Optional function that's called *after* the very first listener is added
   */
  onDidAddFirstListener?: Function;
  /**
   * Optional function that's called after a listener is added
   */
  onDidAddListener?: Function;
  /**
   * Optional function that's called *after* remove the very last listener
   */
  onDidRemoveLastListener?: Function;
  /**
   * Optional function that's called *before* a listener is removed
   */
  onWillRemoveListener?: Function;
  /**
   * Optional function that's called when a listener throws an error. Defaults to
   * {@link onUnexpectedError}
   */
  onListenerError?: (e: any) => void;
}

/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
	class Document {

		private readonly _onDidChange = new Emitter<(value:string)=>any>();

		public onDidChange = this._onDidChange.event;

		// getter-style
		// get onDidChange(): Event<(value:string)=>any> {
		// 	return this._onDidChange.event;
		// }

		private _doIt() {
			//...
			this._onDidChange.fire(value);
		}
	}
 */
export class Emitter<T> {
  private readonly _options?: EmitterOptions;
  private _disposed?: true;
  private _event?: Event<T>;

  /**
   * A listener, or list of listeners. A single listener is the most common
   * for event emitters (#185789), so we optimize that special case to avoid
   * wrapping it in an array (just like Node.js itself.)
   *
   * A list of listeners never 'downgrades' back to a plain function if
   * listeners are removed, for two reasons:
   *
   *  1. That's complicated (especially with the deliveryQueue)
   *  2. A listener with >1 listener is likely to have >1 listener again at
   *     some point, and swapping between arrays and functions may[citation needed]
   *     introduce unnecessary work and garbage.
   *
   * The array listeners can be 'sparse', to avoid reallocating the array
   * whenever any listener is added or removed. If more than `1 / compactionThreshold`
   * of the array is empty, only then is it resized.
   */
  protected _listeners?: ListenerOrListeners<T>;

  /**
   * Always to be defined if _listeners is an array. It's no longer a true
   * queue, but holds the dispatching 'state'. If `fire()` is called on an
   * emitter, any work left in the _deliveryQueue is finished first.
   */
  private _deliveryQueue?: EventDeliveryQueuePrivate;
  protected _size = 0;

  constructor(options?: EmitterOptions) {
    this._options = options;
  }

  dispose() {
    if (!this._disposed) {
      this._disposed = true;

      // It is bad to have listeners at the time of disposing an emitter, it is worst to have listeners keep the emitter
      // alive via the reference that's embedded in their disposables. Therefore we loop over all remaining listeners and
      // unset their subscriptions/disposables. Looping and blaming remaining listeners is done on next tick because the
      // the following programming pattern is very popular:
      //
      // const someModel = this._disposables.add(new ModelObject()); // (1) create and register model
      // this._disposables.add(someModel.onDidChange(() => { ... }); // (2) subscribe and register model-event listener
      // ...later...
      // this._disposables.dispose(); disposes (1) then (2): don't warn after (1) but after the "overall dispose" is done

      if (this._deliveryQueue?.current === this) {
        this._deliveryQueue.reset();
      }
      if (this._listeners) {
        this._listeners = undefined;
        this._size = 0;
      }

      this._options?.onDidRemoveLastListener?.();
    }
  }

  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event(): Event<T> {
    this._event ??= (
      callback: (e: T) => any,
      thisArgs?: any,
      disposables?: IDisposable[],
    ) => {
      if (this._disposed) {
        // todo: should we warn if a listener is added to a disposed emitter? This happens often
        return Disposable.None;
      }

      if (thisArgs) {
        callback = callback.bind(thisArgs);
      }

      const contained = new UniqueContainer(callback);

      if (!this._listeners) {
        this._options?.onWillAddFirstListener?.(this);
        this._listeners = contained;
        this._options?.onDidAddFirstListener?.(this);
      } else if (this._listeners instanceof UniqueContainer) {
        this._deliveryQueue ??= new EventDeliveryQueuePrivate();
        this._listeners = [this._listeners, contained];
      } else {
        this._listeners.push(contained);
      }

      this._size++;

      const result = toDisposable(() => {
        this._removeListener(contained);
      });

      if (Array.isArray(disposables)) {
        disposables.push(result);
      }

      return result;
    };

    return this._event;
  }

  private _removeListener(listener: ListenerContainer<T>) {
    this._options?.onWillRemoveListener?.(this);

    if (!this._listeners) {
      return; // expected if a listener gets disposed
    }

    if (this._size === 1) {
      this._listeners = undefined;
      this._options?.onDidRemoveLastListener?.(this);
      this._size = 0;
      return;
    }

    // size > 1 which requires that listeners be a list:
    const listeners = this._listeners as (ListenerContainer<T> | undefined)[];

    const index = listeners.indexOf(listener);
    if (index === -1) {
      console.log('disposed?', this._disposed);
      console.log('size?', this._size);
      console.log('arr?', JSON.stringify(this._listeners));
      throw new Error('Attempted to dispose unknown listener');
    }

    this._size--;
    listeners[index] = undefined;

    const adjustDeliveryQueue = this._deliveryQueue!.current === this;
    if (this._size * compactionThreshold <= listeners.length) {
      let n = 0;
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]) {
          listeners[n++] = listeners[i];
        } else if (adjustDeliveryQueue) {
          this._deliveryQueue!.end--;
          if (n < this._deliveryQueue!.i) {
            this._deliveryQueue!.i--;
          }
        }
      }
      listeners.length = n;
    }
  }

  private _deliver(
    listener: undefined | UniqueContainer<(value: T) => void>,
    value: T,
  ) {
    if (!listener) {
      return;
    }

    const errorHandler = this._options?.onListenerError || onUnexpectedError;
    if (!errorHandler) {
      listener.value(value);
      return;
    }

    try {
      listener.value(value);
    } catch (e) {
      errorHandler(e);
    }
  }

  /** Delivers items in the queue. Assumes the queue is ready to go. */
  private _deliverQueue(dq: EventDeliveryQueuePrivate) {
    const listeners = dq.current!._listeners! as (
      | ListenerContainer<T>
      | undefined
    )[];
    while (dq.i < dq.end) {
      // important: dq.i is incremented before calling deliver() because it might reenter deliverQueue()
      this._deliver(listeners[dq.i++], dq.value as T);
    }
    dq.reset();
  }

  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event: T): void {
    if (this._deliveryQueue?.current) {
      this._deliverQueue(this._deliveryQueue);
    }

    if (!this._listeners) {
      // no-op
    } else if (this._listeners instanceof UniqueContainer) {
      this._deliver(this._listeners, event);
    } else {
      const dq = this._deliveryQueue!;
      dq.enqueue(this, event, this._listeners.length);
      this._deliverQueue(dq);
    }
  }

  hasListeners(): boolean {
    return this._size > 0;
  }
}

export interface EventDeliveryQueue {
  _isEventDeliveryQueue: true;
}

export const createEventDeliveryQueue = (): EventDeliveryQueue =>
  new EventDeliveryQueuePrivate();

class EventDeliveryQueuePrivate implements EventDeliveryQueue {
  declare _isEventDeliveryQueue: true;

  /**
   * Index in current's listener list.
   */
  public i = -1;

  /**
   * The last index in the listener's list to deliver.
   */
  public end = 0;

  /**
   * Emitter currently being dispatched on. Emitter._listeners is always an array.
   */
  public current?: Emitter<any>;
  /**
   * Currently emitting value. Defined whenever `current` is.
   */
  public value?: unknown;

  public enqueue<T>(emitter: Emitter<T>, value: T, end: number) {
    this.i = 0;
    this.end = end;
    this.current = emitter;
    this.value = value;
  }

  public reset() {
    this.i = this.end; // force any current emission loop to stop, mainly for during dispose
    this.current = undefined;
    this.value = undefined;
  }
}
