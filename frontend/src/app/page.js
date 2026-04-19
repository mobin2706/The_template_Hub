'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Download, Star, Users, FileText, Sparkles,
  GraduationCap, Briefcase, Palette, Cpu, HeartPulse, Scale,
  Megaphone, MoreHorizontal, TrendingUp, Award, ChevronRight, Zap
} from 'lucide-react';
import api from '@/lib/api';
import TemplateCard from '@/components/templates/TemplateCard';
import { SkeletonGrid } from '@/components/ui/LoadingSpinner';

const categories = [
  { name: 'Education', icon: GraduationCap, color: 'from-violet-500 to-purple-600', desc: 'Academic papers, syllabi & more' },
  { name: 'Business', icon: Briefcase, color: 'from-blue-500 to-indigo-600', desc: 'Proposals, reports & plans' },
  { name: 'Design', icon: Palette, color: 'from-pink-500 to-rose-600', desc: 'Portfolios & creative assets' },
  { name: 'Technology', icon: Cpu, color: 'from-cyan-500 to-teal-600', desc: 'Tech docs & pitch decks' },
  { name: 'Healthcare', icon: HeartPulse, color: 'from-emerald-500 to-green-600', desc: 'Medical reports & records' },
  { name: 'Legal', icon: Scale, color: 'from-amber-500 to-yellow-600', desc: 'Contracts & agreements' },
  { name: 'Marketing', icon: Megaphone, color: 'from-red-500 to-orange-600', desc: 'Campaigns & strategies' },
  { name: 'Other', icon: MoreHorizontal, color: 'from-gray-500 to-slate-600', desc: 'Everything else' },
];

const stats = [
  { label: 'Templates', value: 12000, suffix: '+', icon: FileText },
  { label: 'Downloads', value: 850, suffix: 'K+', icon: Download },
  { label: 'Creators', value: 3200, suffix: '+', icon: Users },
  { label: 'Rating', value: 4.9, suffix: '/5', icon: Star },
];

function AnimatedCounter({ target, suffix, duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{Number.isInteger(target) ? Math.floor(count).toLocaleString() : count.toFixed(1)}{suffix}</span>;
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendingRes, ratedRes, creatorsRes] = await Promise.all([
        api.get('/templates/trending?type=downloads&limit=4'),
        api.get('/templates/trending?type=rating&limit=4'),
        api.get('/users/leaderboard/top')
      ]);
      setTrending(trendingRes.data.templates || []);
      setTopRated(ratedRes.data.templates || []);
      setCreators(creatorsRes.data.creators || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center gradient-mesh">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-[10%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-40 right-[15%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 left-[30%] w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl"
          />
        </div>

        {/* Floating 3D elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[8%] w-16 h-20 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 backdrop-blur-sm"
            style={{ transform: 'perspective(800px) rotateY(15deg)' }}
          />
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-[25%] right-[12%] w-20 h-24 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-600/20 border border-cyan-500/20 backdrop-blur-sm"
            style={{ transform: 'perspective(800px) rotateY(-10deg)' }}
          />
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[20%] left-[15%] w-14 h-18 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/20 backdrop-blur-sm"
          />
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-[30%] right-[8%] w-12 h-16 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20 backdrop-blur-sm"
          />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-[var(--text-secondary)] font-medium">
                Official <span className="text-emerald-400 font-bold">Class Project</span> Submission
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: 'Space Grotesk' }}>
              <span className="text-[var(--text-primary)]">The Ultimate </span>
              <br className="hidden sm:block" />
              <span className="gradient-text">Template Library</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--text-primary)]">for Professionals</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-10 leading-relaxed italic border-l-4 border-emerald-400 pl-4 text-left">
              &quot;Create a platform where users upload templates for documents such as reports or presentations. Templates should be categorized by purpose and subject area. Other users should download and rate templates. Popular templates should be displayed prominently.&quot;
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/templates">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-base px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Explore Templates
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.button>
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-outline text-base px-8 py-4 rounded-xl flex items-center gap-2"
                >
                  Start Creating <Zap className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass rounded-2xl p-4 text-center group hover:border-[var(--color-primary)] transition-all">
                  <Icon className="w-5 h-5 text-[var(--color-primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl sm:text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            Browse by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Find the perfect template for your needs across 8 specialized categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/templates?category=${cat.name}`}
                  className="group block glass card-hover rounded-2xl p-5 text-center"
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">{cat.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== TRENDING SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-primary)]">Trending Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
              Most <span className="gradient-text">Downloaded</span>
            </h2>
          </div>
          <Link
            href="/templates?sort=popular"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : (
          <div className="template-grid">
            {trending.map((template, i) => (
              <TemplateCard key={template._id} template={template} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ===== TOP RATED SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-amber-400">Community Favorites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
              Highest <span className="gradient-text">Rated</span>
            </h2>
          </div>
          <Link
            href="/templates?sort=rating"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : (
          <div className="template-grid">
            {topRated.map((template, i) => (
              <TemplateCard key={template._id} template={template} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ===== TOP CREATORS SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Leaderboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
            Top <span className="gradient-text">Creators</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {creators.slice(0, 6).map((creator, i) => (
            <motion.div
              key={creator.user?._id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass card-hover rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="relative">
                {i < 3 && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10 ${
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                  }`}>
                    {i + 1}
                  </div>
                )}
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-lg font-bold">
                  {creator.user?.name?.charAt(0) || '?'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[var(--text-primary)] text-sm truncate">
                  {creator.user?.name || 'Unknown'}
                </h4>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {creator.templateCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" /> {creator.totalDownloads?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {creator.avgRating}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl gradient-primary p-10 sm:p-16 text-center"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk' }}>
              Ready to Share Your Work?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of creators and help professionals around the world find the perfect template.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/upload">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-[#7c3aed] font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-xl flex items-center gap-2"
                >
                  Start Uploading <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/templates">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors border border-white/20"
                >
                  Browse Templates
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
