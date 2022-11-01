/* eslint-disable @typescript-eslint/no-use-before-define */
import { json, LoaderArgs } from '@remix-run/node'
import { useLoaderData, useFetcher } from '@remix-run/react'
import { createMachine, send } from 'xstate'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useMachine } from '@xstate/react'
import { getTopic, Item, Comment } from '~/models/topic.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  const { id } = params
  const topic = await getTopic(Number(id))
  return json({ topic })
}

export default function () {
  const { topic } = useLoaderData<typeof loader>()
  return (
    <div className="m-2">
      <h1 className="text-2xl font-bold">{topic.name}</h1>
      <p className="text-sm text-gray-600 italic">
        Click items to expand comments
      </p>
      <p className="text-sm text-gray-600 italic">
        Comments are stored in session cookie to simulate backend storage
      </p>
      <ul>
        {topic?.items?.map((item) => (
          <li key={item.id}>
            <ItemDisplay item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ItemDisplay({ item }: { item: Item }) {
  const [showComments, setShowComments] = useState(false)

  return (
    <div className="mt-4 ml-2" onClick={() => setShowComments(true)}>
      <h2 className="text-xl font-bold">{item.name}</h2>
      {/* only render comments when user expands */}
      {showComments && <ItemComments itemId={item.id} />}
    </div>
  )
}

function ItemComments({ itemId }: { itemId: number }) {
  const commentLoader = useFetcher()
  const commentPoster = useFetcher()
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const loadComments = useCallback(() => {
    console.log('loading comments...')
    commentLoader.load(`/topics/${itemId}/comments`)
  }, [commentLoader, itemId])

  const [state, send] = useMachine(commentListMachine, {
    actions: {
      loadComments,
    },
  })
  // notify machine when comments are loaded
  useEffect(() => {
    if (commentLoader.type === 'done') {
      console.log('comments loaded')
      send('COMMENTS_LOADED')
    }
  }, [commentLoader.type, send])

  // notify machine when comment has been submitted
  useEffect(() => {
    if (commentPoster.type === 'actionSubmission' && commentRef.current) {
      // clear comment textarea
      commentRef.current.value = ''
    }
    if (commentPoster.type === 'done') {
      console.log('comment submitted')
      send('COMMENT_SUBMITTED')
    }
  }, [commentPoster.type, send])

  // we either use comment from submission
  // or if refreshing comment list, from submit fetcher.data
  const optimisicComment = commentPoster.submission
    ? { id: 0, text: String(commentPoster.submission.formData.get('text')) }
    : commentLoader.state === 'loading' && commentPoster.data
    ? commentPoster.data.comment
    : null

  console.log({
    machineState: state.value,
    loaderState: commentLoader.state,
    loaderType: commentLoader.type,
    commentCount: commentLoader.data?.comments?.length ?? 0,
    posterState: commentPoster.state,
    posterType: commentPoster.type,
    optimisicComment,
  })
  return (
    <div className="ml-4">
      {commentLoader.data &&
        commentLoader.data.comments?.map((comment: Comment) => (
          <div className="border-b p-4" key={comment.id}>
            {comment.text}
          </div>
        ))}
      {/* optimistically add comment*/}
      {optimisicComment && (
        <div className="border-b p-4" key={optimisicComment.id}>
          {optimisicComment.text}
        </div>
      )}
      <commentPoster.Form
        className="ml-4"
        method="post"
        action={`/topics/${itemId}/comments`}
      >
        <textarea
          ref={commentRef}
          className="border w-96 h-24 p-2"
          name="text"
          autoFocus={true}
          placeholder="Enter a comment"
        ></textarea>
        <button className="mt-2 block rounded bg-blue-300 px-2 py-2">
          Submit
        </button>
      </commentPoster.Form>
    </div>
  )
}

const commentListMachine = createMachine({
  initial: 'start',
  states: {
    start: {
      always: {
        target: 'idle',
        actions: [send('LOAD_COMMENTS')],
      },
    },
    idle: {
      on: {
        LOAD_COMMENTS: {
          target: 'loading_comments',
          actions: ['loadComments'],
        },
        COMMENT_SUBMITTED: {
          actions: [send('LOAD_COMMENTS')],
        },
      },
    },
    loading_comments: {
      on: {
        COMMENTS_LOADED: 'idle',
      },
    },
  },
})
