import { json, LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getTopics } from '~/models/topic.server'

export const loader = async ({ request }: LoaderArgs) => {
  const topics = await getTopics()
  return json({ topics })
}

export default function Index() {
  const { topics } = useLoaderData<typeof loader>()

  return (
    <div className="m-2">
      <h1 className="text-2xl font-bold">Topic List!</h1>
      <p className="text-sm text-gray-600 italic">Click on a topic</p>
      <ul>
        {topics.map((topic) => (
          <li key={topic.id} className="mt-4 ml-2">
            <Link to={`${topic.id}`}>
              <h2 className="text-xl font-bold">{topic.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
