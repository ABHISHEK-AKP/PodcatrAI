import { ConvexError,v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUrl = mutation({
    args:{
        storageId: v.id('_storage')
    },
    handler: async(ctx , args) =>{
        return await ctx.storage.getUrl(args.storageId);
    }
})

export const createPodcast = mutation({
    args:{
            podcastTitle:v.string(),
            podcastDescription:v.string(),
            audioURL:v.string(),
            imageURL:v.string(),
            voiceType:v.string(),
            imagePrompt:v.string(),
            voicePrompt:v.string(),
            views:v.number(),
            audioDuration:v.number(),
            audioStorageId:v.id('_storage'),
            imageStorageId:v.id('_storage'),
    },
    handler: async(_ctx, args)=>{
        const identity = await _ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("Not authenticated");
        }
        const user = await _ctx.db.query("users")
        .filter((q)=>q.eq(q.field('email'), identity.email))
        .collect();
        if(user.length==0){
            throw new ConvexError("User not found");
        }
        const podcast = await _ctx.db.insert("podcasts",
            {
                ...args,
                user:user[0]._id,
                author: user[0].name,
                authorId: user[0].clerkId,
                authorImageURL: user[0].imageURL
            }
        )
        return podcast;
    }
})

export const getTrendingPodcasts = query({
    handler: async (ctx)=>{
        const podcasts = await ctx.db.query('podcasts').collect();
        return podcasts.sort((a, b) => b.views - a.views).slice(0, 8);;
    }
})
export const getPodcastById  = query({
    args:{podcastId:v.id('podcasts')},
    handler: async (ctx,args)=>{
        return await ctx.db.get(args.podcastId);
    }
})
export const getPodcastByVoiceType = query({
    args: {
      podcastId: v.id("podcasts"),
    },
    handler: async (ctx, args) => {
      const podcast = await ctx.db.get(args.podcastId);
  
      return await ctx.db
        .query("podcasts")
        .filter((q) =>
          q.and(
            q.eq(q.field("voiceType"), podcast?.voiceType),
            q.neq(q.field("_id"), args.podcastId)
          )
        )
        .collect();
    },
  });
  export const getAllPodcasts = query({
    handler: async (ctx) => {
      return await ctx.db.query("podcasts").order("desc").collect();
    },
  });
  export const getPodcastByAuthorId = query({
    args: {
      authorId: v.string(),
    },
    handler: async (ctx, args) => {
      const podcasts = await ctx.db
        .query("podcasts")
        .filter((q) => q.eq(q.field("authorId"), args.authorId))
        .collect();
  
      const totalListeners = podcasts.reduce(
        (sum, podcast) => sum + podcast.views,
        0
      );
  
      return { podcasts, listeners: totalListeners };
    },
  });
  export const getPodcastBySearch = query({
    args: {
      search: v.string(),
    },
    handler: async (ctx, args) => {
      if (args.search === "") {
        return await ctx.db.query("podcasts").order("desc").collect();
      }
  
      const authorSearch = await ctx.db
        .query("podcasts")
        .withSearchIndex("search_author", (q) => q.search("author", args.search))
        .take(10);
  
      if (authorSearch.length > 0) {
        return authorSearch;
      }
  
      const titleSearch = await ctx.db
        .query("podcasts")
        .withSearchIndex("search_title", (q) =>
          q.search("podcastTitle", args.search)
        )
        .take(10);
  
      if (titleSearch.length > 0) {
        return titleSearch;
      }
  
      return await ctx.db
        .query("podcasts")
        .withSearchIndex("search_body", (q) =>
          q.search("podcastDescription", args.search)
        )
        .take(10);
    },
  });
  export const updatePodcastViews = mutation({
    args: {
      podcastId: v.id("podcasts"),
    },
    handler: async (ctx, args) => {
      const podcast = await ctx.db.get(args.podcastId);
  
      if (!podcast) {
        throw new ConvexError("Podcast not found");
      }
  
      return await ctx.db.patch(args.podcastId, {
        views: podcast.views + 1,
      });
    },
  });
  export const deletePodcast = mutation({
    args: {
      podcastId: v.id("podcasts"),
      imageStorageId: v.id("_storage"),
      audioStorageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
      const podcast = await ctx.db.get(args.podcastId);
  
      if (!podcast) {
        throw new ConvexError("Podcast not found");
      }
  
      await ctx.storage.delete(args.imageStorageId);
      await ctx.storage.delete(args.audioStorageId);
      return await ctx.db.delete(args.podcastId);
    },
  });
