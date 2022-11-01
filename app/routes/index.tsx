import { Link } from '@remix-run/react'
import { redirect } from '@remix-run/node'

export const loader = async () => {
  return redirect('/topics')
}
export default function Index() {
  return (
    <div className="m-2">
      <h1 className="text-2xl font-bold">Welcome to Remix Starter!</h1>

      <Link to="topics">View Topics</Link>
    </div>
  )
}
