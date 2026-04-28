import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Award, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import JobsPage from "./JobsPage";
import SkillsPage from "./SkillsPage";
import MentorsPage from "./MentorsPage";

import heroImage from "@/assets/hero-community.jpg";

const GrowPage = () => {
  return (
    <section className="min-h-screen pb-24 md:pb-8">
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 h-[40vh]">
          <img
            src={heroImage}
            alt="Community Growth"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 text-xs font-extrabold text-primary rounded-full glass-card">
              <Sparkles size={12} />
              AI-powered recommendations
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
              Grow 🌱
            </h1>

            <p className="max-w-md text-sm font-medium text-muted-foreground">
              Build your future at your own pace. Explore jobs, learn new skills,
              and connect with mentors — all in one place.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container py-4 relative z-10">
        <Tabs defaultValue="jobs" className="space-y-5">

          <TabsList className="grid w-full grid-cols-3 p-1.5 rounded-2xl glass-card">
            
            <TabsTrigger
              value="jobs"
              className="flex items-center justify-center gap-1.5 py-3 text-sm font-extrabold rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card"
            >
              <Briefcase size={14} />
              Jobs
            </TabsTrigger>

            <TabsTrigger
              value="skills"
              className="flex items-center justify-center gap-1.5 py-3 text-sm font-extrabold rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card"
            >
              <GraduationCap size={14} />
              Skills
            </TabsTrigger>

            <TabsTrigger
              value="mentors"
              className="flex items-center justify-center gap-1.5 py-3 text-sm font-extrabold rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card"
            >
              <Award size={14} />
              Mentors
            </TabsTrigger>

          </TabsList>

          {/* Tab Content */}
          <TabsContent value="jobs">
            <JobsPage />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsPage />
          </TabsContent>

          <TabsContent value="mentors">
            <MentorsPage />
          </TabsContent>

        </Tabs>
      </div>
    </section>
  );
};

export default GrowPage;