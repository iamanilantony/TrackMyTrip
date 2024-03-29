import { useUser } from "@clerk/nextjs";
import type {GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { generateSSGHelper } from "~/server/api/helpers/ssgHelper";
import { PageLayout } from "../components/layout";
import { PostView } from "../components/postView";
import { LoadingPage } from "../components/loading";

const ProfileFeed = (props: {userId: string}) => {
    const {data, isLoading} = api.posts.getPostsByUserId.useQuery({
        userId: props.userId
    });

    if (isLoading) return <LoadingPage/>

    if(!data || data.length == 0) return <div>User Has not posted</div>

    return(
        <div className="flex flex-col">
            {data.map((fullPost)=> (
                <PostView {...fullPost} key={fullPost.post.id}/>
            ))}
        </div>
    )

}


const ProfilePage: NextPage<{userName: string}> = ({userName}) => {
  const { isLoaded: userLoaded } = useUser()

  const {data} = api.profile.getUserByUserName.useQuery({
    userName
  })

  if(!data) return <div>404</div>

  if (!userLoaded) return <div />


  return (
    <>
      <Head>
        <title>{data.userName}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
            <Image
                src={data.profilePicture}
                alt={`${data.userName ?? ""}'s profile pic`}
                width={128}
                height={128}
                className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
            />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.userName ?? ""}`}</div>  
        <div className="border-b border-slate-400 w-full"/>  
        <ProfileFeed userId={data.id}/>

      </PageLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
    const ssg = generateSSGHelper();

    const slug = context.params?.slug;

    if (typeof slug !== 'string') throw new Error("No Slug");

    const userName = slug.replace("@", "");

    await ssg.profile.getUserByUserName.prefetch({ userName });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            userName
        }
    }
}

export const getStaticPaths = () => {
    return { paths: [], fallback: "blocking" }
}

export default ProfilePage
