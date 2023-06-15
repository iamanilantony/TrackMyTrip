import { useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { api } from "~/utils/api"
import { LoadingPage, LoadingSpinner } from "~/components/loading"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { PageLayout } from "../components/layout"
import { PostView } from "../components/postView"
import { NavBar } from "~/components/navbar"
import Leftfeed from "~/components/leftfeed"
import RightFeed from "~/components/rightFeed"

const CreatePostWizard = () => {
  const { user } = useUser()
  const [input, setInput] = useState("")

  const ctx = api.useContext()

  if (!user) return null

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("")
      void ctx.posts.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to post, please try again later")
      }
    },
  })

  return (
    <div className="flex border-b border-slate-400 p-8 align-middle">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
      />
      <input
        placeholder="Type Your tweet"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            if (input !== "") {
              mutate({ content: input })
            }
          }
        }}
      />
      {input && !isPosting && (
        <button
          className={
            "rounded-md bg-blue-500 px-6 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-violet-300 active:bg-violet-700 "
          }
          onClick={() => mutate({ content: input })}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery()
  const { isLoaded: userLoaded, isSignedIn } = useUser()
  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>
  if (!userLoaded) return <div />

  return (
    <div className="flex w-1/3 flex-col">
      {isSignedIn && <CreatePostWizard />}
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  //start fetching a.s.a.p
  api.posts.getAll.useQuery()

  return (
    <>
      <Head>
        <title>Twitter Clone</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <div>
          <NavBar />
        </div>
      <PageLayout>
        <div>
          <Leftfeed />
        </div>
        <div>
          <Feed />
        </div>
        <div>
          <RightFeed />
        </div>
      </PageLayout>
    </>
  )
}

export default Home
