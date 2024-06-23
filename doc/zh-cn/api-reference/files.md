# 本地文件

## 上传文件

`POST /v1/files`

上传可在不同 API Endpoints 上使用的文件。

### 请求内容

- `File` file **Required**

  要上传的文件对象（不是文件名）。

### 返回

上传的 [文件对象](#文件对象) 对象。

## 查找文件

`GET /v1/files/{file_id}`

返回特定文件的信息。

### 返回

与指定 ID 匹配的 [文件](#文件对象) 对象。

## 删除文件

`DELETE /v1/files/{file_id}`

删除一个文件

### 返回

删除状态。

## 获取文件内容

`GET /v1/files/{file_id}/content`

返回指定文件的内容。

### 返回

这个文件的内容。

## 对象定义

### 文件对象

```ts
export interface IFile {
  /**
   * The file identifier, which can be referenced in the API endpoints.
   */
  id: number;

  /**
   * The file name.
   */
  filename: string;

  /**
   * The MIME type of the file.
   */
  mimetype: string;

  /**
   * The size of the file, in bytes.
   */
  size: number;

  /**
   * The object type, which is always "file".
   */
  object: 'file';

  /**
   * The Unix timestamp when the model was created.
   */
  createdAt: number;
}
```
