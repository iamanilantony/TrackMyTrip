import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { PrivateProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { Post } from "@prisma/client";
import { filterUserForClient } from "../helpers/filterUserForClient";

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true
});

const addUserDataToPosts = async (posts: Post[]) => {
    const users = (
        await clerkClient.users
            .getUserList({ userId: posts.map((post) => post.authorId), limit: 100 })
    ).map(filterUserForClient);
    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);
        if (!author || !author.userName) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author for post not found"
        })
        return {
            post,
            author: {
                ...author,
                userName: author.userName
            }
        }
    });
}


export const postRouter = createTRPCRouter({
    getPostById: publicProcedure
        .input(
            z.object({
                id: z.string()
            })
        )
        .query(async ({ input, ctx }) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.id
                }
            });
            if (!post) throw new TRPCError({code: 'NOT_FOUND'});
            return (await addUserDataToPosts([post]))[0];
        })

    ,
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{ createdAt: "desc" }]
        });
        return addUserDataToPosts(posts);
    }),

    getPostsByUserId: publicProcedure
        .input(
            z.object({
                userId: z.string()
            })
        )
        .query(({ ctx, input }) =>
            ctx.prisma.post.findMany({
                where: {
                    authorId: input.userId
                },
                take: 100,
                orderBy: [{ createdAt: "desc" }]
            })
                .then(addUserDataToPosts)
        )
    ,

    create: PrivateProcedure
        .input(
            z.object({
                content: z.string().min(1).max(280),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;

            const { success } = await ratelimit.limit(authorId);
            if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

            const post = await ctx.prisma.post.create({
                data: {
                    authorId,
                    content: input.content
                }
            })
            return post;
        })
})