import { json, ActionArgs, LoaderArgs } from '@remix-run/node'
import { addComment, getItemComments } from '~/models/topic.server'
import { getSession, commitSession } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  // using session to simulate backend database
  const session = await getSession(request.headers.get('cookie'))
  const { itemId } = params
  const comments = await getItemComments(session, Number(itemId))
  return json(
    { comments },
    {
      headers: {
        'set-cookie': await commitSession(session),
      },
    },
  )
}

export const action = async ({ request, params }: ActionArgs) => {
  const session = await getSession(request.headers.get('cookie'))
  const { itemId } = params
  const formData = await request.formData()
  const text = String(formData.get('text') ?? '')
  const comment = await addComment(session, Number(itemId), { id: 0, text })
  return json(
    { comment },
    {
      headers: {
        'set-cookie': await commitSession(session),
      },
    },
  )
}
