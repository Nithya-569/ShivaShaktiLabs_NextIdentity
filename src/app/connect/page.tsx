/* eslint-disable no-console */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Shield, MessageCircle, Heart, Users, Compass, Bell, Edit2, Trash2, X, Check, MapPin, Search, Filter, UserPlus } from "lucide-react";
import { getNotifications, sendReplyNotification, joinCommunity, leaveCommunity, likePost, getCommunitiesWithMembership } from "@/services/connect";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["All", "Support", "Career", "Housing", "Legal", "Social"];

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState<"community" | "anonymous" | "messages">("anonymous");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Data states
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Forms and overlays
  const [isComposingPost, setIsComposingPost] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [isAnonPost, setIsAnonPost] = useState(true);

  const [isComposingCommunity, setIsComposingCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [communityDesc, setCommunityDesc] = useState("");
  const [communityCity, setCommunityCity] = useState("");
  const [communityCategory, setCommunityCategory] = useState("Social");

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch user and profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user || null;
      setCurrentUser((prev: any) => prev?.id === newUser?.id ? prev : newUser);

      if (newUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", newUser.id)
          .single();
        setUserProfile(profileData);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error.message, error.details, error.hint);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const fetchCommunities = async () => {
    setIsLoading(true);
    if (currentUser) {
      const data = await getCommunitiesWithMembership(currentUser.id);
      setCommunities(data);
    } else {
      const { data, error } = await supabase.from("communities").select("*").order("created_at", { ascending: false });
      if (error) console.error("Error fetching communities:", error);
      setCommunities(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === "anonymous") {
      fetchPosts();
    } else if (activeTab === "community") {
      fetchCommunities();
    } else if (activeTab === "messages") {
      setIsLoading(true);
      getNotifications().then(data => { setNotifications(data); setIsLoading(false); });
    }
  }, [activeTab, currentUser]);

  // Filtered communities based on search and category
  const filteredCommunities = useMemo(() => {
    let filtered = communities;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(comm => comm.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comm =>
        comm.name?.toLowerCase().includes(query) ||
        comm.city?.toLowerCase().includes(query) ||
        comm.category?.toLowerCase().includes(query) ||
        comm.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [communities, selectedCategory, searchQuery]);

  // Sort communities: user's city first if profile has city
  const sortedCommunities = useMemo(() => {
    if (!userProfile?.city) return filteredCommunities;

    const userCity = userProfile.city.toLowerCase();
    const sorted = [...filteredCommunities];

    sorted.sort((a, b) => {
      const aMatch = a.city?.toLowerCase() === userCity;
      const bMatch = b.city?.toLowerCase() === userCity;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    return sorted;
  }, [filteredCommunities, userProfile]);

  const createPost = async () => {
    if (!newPostText.trim()) return;

    const { error } = await supabase.from("posts").insert({
      content: newPostText,
      is_anonymous: isAnonPost,
      user_id: isAnonPost ? null : currentUser?.id,
      community_id: null
    });

    if (error) {
      console.error("Error creating post:", error);
    } else {
      setNewPostText("");
      setIsComposingPost(false);
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("Error deleting post:", error);
    } else {
      fetchPosts();
    }
  };

  const updatePost = async (id: string, newContent: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ content: newContent })
      .eq("id", id);

    if (error) {
      console.error("Error updating post:", error);
    } else {
      setEditingPostId(null);
      fetchPosts();
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    await likePost(postId, currentLikes);
  };

  const handleReply = async (post: any) => {
    alert("Reply feature ready. Submitting will notify the user!");
    if (post.user_id) {
      await sendReplyNotification(post.user_id);
    }
  };

  const handleCreateCommunity = async () => {
    if (!communityName.trim()) return;

    const { data: userData } = await supabase.auth.getSession();

    const { error } = await supabase.from("communities").insert({
      name: communityName,
      description: communityDesc,
      city: communityCity || 'Online',
      category: communityCategory,
      created_by: userData?.session?.user?.id
    });

    if (error) {
      console.error("Error creating community:", error);
    } else {
      setCommunityName("");
      setCommunityDesc("");
      setCommunityCity("");
      setCommunityCategory("Social");
      setIsComposingCommunity(false);
      fetchCommunities();
    }
  };

  const handleJoinCommunity = async (id: string) => {
    if (!currentUser) {
      alert("Please sign in to join communities");
      return;
    }

    const { error } = await joinCommunity(id);
    if (error) {
      console.error("Join error:", error);
      if (error.message?.includes("duplicate") || error.message?.includes("Already")) {
        alert("You're already a member of this community!");
      } else {
        alert(error.message || "Failed to join");
      }
    } else {
      // Update local state to show joined and increment member count
      setCommunities(communities.map(comm =>
        comm.id === id ? { ...comm, is_member: true, member_count: (comm.member_count || 0) + 1 } : comm
      ));
      alert("Successfully joined the community!");
    }
  };

  const handleLeaveCommunity = async (id: string) => {
    if (!currentUser) {
      alert("Please sign in to leave communities");
      return;
    }

    const { error } = await leaveCommunity(id);
    if (error) {
      console.error("Leave error:", error);
      alert(error.message || "Failed to leave");
    } else {
      // Update local state to show left and decrement member count
      setCommunities(communities.map(comm =>
        comm.id === id ? { ...comm, is_member: false, member_count: Math.max((comm.member_count || 1) - 1, 0) } : comm
      ));
      alert("Successfully left the community!");
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Support": "bg-purple-100 text-purple-700",
      "Career": "bg-blue-100 text-blue-700",
      "Housing": "bg-green-100 text-green-700",
      "Legal": "bg-orange-100 text-orange-700",
      "Social": "bg-pink-100 text-pink-700"
    };
    return colors[category] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="w-full relative min-h-screen pb-32">
      {/* Background gradient specifically for Connect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F0FC] via-[#F4F7F9] to-[#EAE6F9] -z-10 fixed" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-6 md:px-12 pt-8 md:pt-16">

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Connect 💜</h1>
          <p className="text-lg text-slate-600 font-medium">Your community, your conversations, your people. Share stories, find support, and build meaningful connections.</p>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-teal-600 text-teal-700 rounded-xl font-bold ext-sm shadow-sm hover:bg-teal-50 transition-colors">
            <Compass className="w-4 h-4" /> Find Similar Journeys
          </button>
        </div>

        <div className="flex bg-white/60 p-2 rounded-2xl border border-white/40 shadow-sm overflow-x-auto gap-2">
          <button onClick={() => setActiveTab("anonymous")} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'anonymous' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-600 hover:bg-white/60'}`}>
            <Shield className="w-5 h-5" /> Anonymous
          </button>
          <button onClick={() => setActiveTab("community")} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'community' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-600 hover:bg-white/60'}`}>
            <Users className="w-5 h-5" /> Community
          </button>
          <button onClick={() => setActiveTab("messages")} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'messages' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-600 hover:bg-white/60'}`}>
            <MessageCircle className="w-5 h-5" /> Messages
          </button>
        </div>

        {/* TAB LOGIC RENDER */}
        <div className="w-full flex flex-col gap-5 mt-4">

          {activeTab === "anonymous" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Anonymous Feed</h2>
                  <p className="text-slate-500 font-medium mt-1">A safe space for honest thoughts</p>
                </div>
                <button onClick={() => setIsComposingPost(true)} className="w-12 h-12 bg-teal-700 text-white rounded-[1rem] flex items-center justify-center shadow-md hover:bg-teal-600 transition-colors shrink-0">
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                {isLoading ? (
                  <p className="text-slate-500 font-medium animate-pulse">Loading safe space...</p>
                ) : posts.length === 0 ? (
                  <p className="text-slate-500 font-medium">Be the first to post!</p>
                ) : posts.map((post) => (
                  <div key={post.id} className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold text-[15px]">
                            {post.is_anonymous ? 'Anonymous 🛡️' : 'Verified User'}
                          </span>
                          <span className="text-slate-500 text-xs font-semibold">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {currentUser && post.user_id === currentUser.id && !post.is_anonymous && (
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }} className="text-slate-400 hover:text-teal-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletePost(post.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingPostId === post.id ? (
                      <div className="mt-4 flex flex-col gap-3">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingPostId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm">Cancel</button>
                          <button onClick={() => updatePost(post.id, editContent)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold text-sm">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-[16px] leading-relaxed mt-4 font-medium break-words">
                        {post.content}
                      </p>
                    )}

                    <div className="flex gap-6 mt-5 pt-4 border-t border-slate-100">
                      <button onClick={() => handleLike(post.id, post.likes_count)} className="flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-colors group">
                        <Heart className="w-5 h-5 group-active:scale-95" /> <span className="text-sm font-bold">{post.likes_count || 0}</span>
                      </button>
                      <button onClick={() => handleReply(post)} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors">
                        <MessageCircle className="w-5 h-5" /> <span className="text-sm font-bold">Reply</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "community" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Communities</h2>
                  <p className="text-slate-500 font-medium mt-1">Find your people, build together</p>
                </div>
                {currentUser && (
                  <button onClick={() => setIsComposingCommunity(true)} className="w-12 h-12 bg-teal-700 text-white rounded-[1rem] flex items-center justify-center shadow-md hover:bg-teal-600 transition-colors shrink-0">
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Search and Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search communities..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="appearance-none w-full md:w-48 px-4 py-3 pr-10 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Recommended Section - Show if user has city */}
              {userProfile?.city && (
                <div className="bg-gradient-to-r from-teal-50 to-purple-50 border border-teal-100 rounded-2xl p-4">
                  <p className="text-sm font-bold text-teal-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Recommended in {userProfile.city}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 mt-4">
                {isLoading ? (
                  <p className="text-slate-500 font-medium animate-pulse">Finding communities...</p>
                ) : sortedCommunities.length === 0 ? (
                  <p className="text-slate-500 font-medium">No communities found. Try a different search or category.</p>
                ) : sortedCommunities.map((comm) => (
                  <div key={comm.id} className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-slate-800 font-bold text-xl">{comm.name}</h3>
                          {comm.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {comm.is_member && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              <Check className="w-3 h-3" /> Joined
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 mt-2 font-medium">{comm.description}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {comm.city && (
                            <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                              <MapPin className="w-4 h-4" /> {comm.city}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                            <UserPlus className="w-4 h-4" /> {comm.member_count || 0} members
                          </span>
                          {comm.category && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(comm.category)}`}>
                              {comm.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {comm.is_member ? (
                        <button
                          onClick={() => handleLeaveCommunity(comm.id)}
                          className="px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-700 font-bold rounded-xl transition-all w-full md:w-auto text-center shrink-0"
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(comm.id)}
                          className="px-6 py-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-teal-700 font-bold rounded-xl transition-all w-full md:w-auto text-center shrink-0"
                        >
                          Join In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "messages" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Notifications</h2>
                  <p className="text-slate-500 font-medium mt-1">Updates and messages for you</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                {isLoading ? (
                  <p className="text-slate-500 font-medium animate-pulse">Loading messages...</p>
                ) : !currentUser ? (
                  <p className="text-slate-500 font-medium">Please sign in to view your notifications.</p>
                ) : notifications.length === 0 ? (
                  <p className="text-slate-500 font-medium">No new messages yet.</p>
                ) : notifications.map((notif) => (
                  <div key={notif.id} className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <span className="text-slate-800 font-bold capitalize">{notif.type} Update</span>
                    </div>
                    <p className="text-slate-600 font-medium ml-6">{notif.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compose POST Overlay */}
      {isComposingPost && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
            <h3 className="text-slate-800 text-2xl font-black tracking-tight">Share Your Thoughts</h3>
            <textarea
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              placeholder="What's safely on your mind?"
              className="w-full bg-slate-50/50 text-slate-800 placeholder-slate-400 rounded-2xl p-6 min-h-[160px] text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-200"
            />

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonPost}
                onChange={e => setIsAnonPost(e.target.checked)}
                className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
              />
              <span className="text-slate-700 font-bold">Post anonymously 🛡️</span>
            </label>

            <div className="flex gap-4 mt-2">
              <button onClick={() => setIsComposingPost(false)} className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full font-bold text-lg transition-colors">
                Cancel
              </button>
              <button onClick={createPost} className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold text-lg transition-colors shadow-md shadow-teal-500/20">
                Post Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose COMMUNITY Overlay */}
      {isComposingCommunity && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
            <h3 className="text-slate-800 text-2xl font-black tracking-tight">Create Community</h3>

            <input
              value={communityName}
              onChange={e => setCommunityName(e.target.value)}
              placeholder="Community Name"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-3 font-medium text-lg"
            />
            <textarea
              value={communityDesc}
              onChange={e => setCommunityDesc(e.target.value)}
              placeholder="What is this community about?"
              className="w-full bg-slate-50/50 text-slate-800 placeholder-slate-400 rounded-2xl p-6 min-h-[100px] text-md focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-200"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">City</label>
                <input
                  value={communityCity}
                  onChange={e => setCommunityCity(e.target.value)}
                  placeholder="e.g., Mumbai"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-3 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Category</label>
                <select
                  value={communityCategory}
                  onChange={e => setCommunityCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-3 font-medium cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button onClick={() => setIsComposingCommunity(false)} className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full font-bold text-lg transition-colors">
                Cancel
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-teal-600 text-teal-700 rounded-xl font-bold text-sm shadow-sm hover:bg-teal-50 transition-colors">
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

