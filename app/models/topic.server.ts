import { range } from '~/utils'

export type Topic = {
  id: number
  name: string
  items?: Item[]
}

export type Item = {
  id: number
  name: string
}

export type Comment = {
  id: number
  text: string
}

export async function getTopics() {
  return range(1, 10).map((i) => ({ id: i, name: `Topic ${i}` } as Topic))
}

export async function getTopic(id: number) {
  return {
    id,
    name: `Topic ${id}`,
    items: range(1, 10).map(
      (i) => ({ id: id * 100 + i, name: `Item ${id}-${i}` } as Item),
    ),
  } as Topic
}

export async function getItemComments(session: any, itemId: number) {
  let comments = session.get(`comments-${itemId}`)
  if (comments) return comments

  comments = range(1, 3).map(
    (i) =>
      ({
        id: itemId * 100 + i,
        text: `Comment ${itemId * 100 + i}`,
      } as Comment),
  )
  session.set(`comments-${itemId}`, comments)
  return comments
}

export async function addComment(
  session: any,
  itemId: number,
  comment: Comment,
) {
  const comments = session.get(`comments-${itemId}`) as Comment[]
  if (comments) {
    let nextId = comments[comments.length - 1].id + 1
    comment.id = nextId
    comments.push(comment)
    session.set(`comments-${itemId}`, comments)
    return comment
  }
}
