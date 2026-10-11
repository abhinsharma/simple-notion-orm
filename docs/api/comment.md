# Comment API Examples

| API             | Returns                 | Description                                          |
| --------------- | ----------------------- | ---------------------------------------------------- |
| `listComments`  | `ListCommentsResponse`  | List open comments on a page or block.               |
| `getComment`    | `GetCommentResponse`    | Retrieve one comment.                                |
| `createComment` | `CreateCommentResponse` | Start a discussion or reply to one.                  |
| `updateComment` | `UpdateCommentResponse` | Replace a comment's text with rich text or markdown. |
| `deleteComment` | `DeleteCommentResponse` | Delete a comment.                                    |

Each helper takes the Notion SDK parameters, so new comment options such as `markdown`, `attachments`, and `display_name` pass straight through.

## Start a discussion

```ts
import { createComment } from "simple-notion-orm";

const comment = await createComment({
  parent: { page_id: "notion-page-id" },
  markdown: "Can we ship this **today**?",
});
```

## Reply, edit, and delete

```ts
import { createComment, deleteComment, updateComment } from "simple-notion-orm";

const reply = await createComment({ discussion_id: "discussion-id", rich_text: [{ type: "text", text: { content: "Yes" } }] });
await updateComment({ comment_id: reply.id, markdown: "Yes, after review" });
await deleteComment(reply.id);
```

`NotionPage#addComment` and `NotionPage#replyToComment` wrap the same API for page handles.
