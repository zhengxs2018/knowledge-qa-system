export interface IBotResource {
  name: string;
  status: 'waiting' | 'scaning' | 'running' | 'stoped';
  object: 'bot.run';
  created: number;
}

export interface IBotProvider {
  readonly name: string;

  run(): Promise<IBotResource>;
  cancel(): Promise<IBotResource>;
}
