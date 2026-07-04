/**
 * Dashboard Intelligence Engine
 * Generates actionable insights, alerts, and recommendations from user data.
 */

const generateDashboardInsights = (products, scoreHistory) => {
  const insights = [];
  const alerts = [];
  const recommendations = [];

  if (!products || products.length === 0) {
    return { insights, alerts, recommendations };
  }

  const total = products.length;
  const byStatus = {};
  products.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

  const oa = byStatus['OA'] || 0;
  const interview = byStatus['Interview'] || 0;
  const selected = byStatus['Selected'] || 0;
  const rejected = byStatus['Rejected'] || 0;

  // ── 1. Platform Intelligence ──────────────────────────
  const platformStats = {};
  products.forEach(p => {
    const pl = p.platform || 'Direct';
    if (!platformStats[pl]) platformStats[pl] = { total: 0, responded: 0 };
    platformStats[pl].total++;
    if (p.status !== 'Applied') platformStats[pl].responded++;
  });

  const platforms = Object.entries(platformStats)
    .map(([name, s]) => ({ name, ...s, rate: s.total > 0 ? s.responded / s.total : 0 }))
    .filter(p => p.total >= 2)
    .sort((a, b) => b.rate - a.rate);

  if (platforms.length >= 2) {
    const best = platforms[0];
    const worst = platforms[platforms.length - 1];
    const ratio = worst.rate > 0 ? (best.rate / worst.rate).toFixed(1) : '∞';

    if (best.rate > worst.rate) {
      insights.push({
        type: 'insight',
        icon: '📊',
        title: `${best.name} outperforms ${worst.name}`,
        body: `${best.name} applications show ${ratio}x higher response rate than ${worst.name}.`,
      });
    }
  }

  if (platforms.length > 0) {
    const best = platforms[0];
    if (best.rate > 0.3) {
      recommendations.push({
        type: 'recommendation',
        icon: '🎯',
        title: `Prioritize ${best.name}`,
        body: `${best.name} has your highest response rate at ${Math.round(best.rate * 100)}%. Double down this week.`,
      });
    }
  }

  // ── 2. Funnel Dropoff Detection ───────────────────────
  const pastApplied = oa + interview + selected + rejected;
  const oaPlus = interview + selected;
  const offerPlus = selected;

  const funnelStages = [
    { from: 'Applied', to: 'OA', entered: total, passed: pastApplied },
    { from: 'OA', to: 'Interview', entered: pastApplied || 1, passed: oaPlus },
    { from: 'Interview', to: 'Offer', entered: oaPlus || 1, passed: offerPlus },
  ];

  let worstDrop = null;
  let worstDropRate = 0;

  funnelStages.forEach(stage => {
    if (stage.entered > 0) {
      const dropoff = 1 - (stage.passed / stage.entered);
      if (dropoff > worstDropRate && stage.entered >= 3) {
        worstDrop = stage;
        worstDropRate = dropoff;
      }
    }
  });

  if (worstDrop && worstDropRate > 0.5) {
    alerts.push({
      type: 'alert',
      icon: '⚠️',
      title: `${worstDrop.from} → ${worstDrop.to} bottleneck`,
      body: `You are losing ${Math.round(worstDropRate * 100)}% of opportunities at the ${worstDrop.from} → ${worstDrop.to} stage.`,
    });
  }

  // ── 3. Weekly Activity Detection ──────────────────────
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = products.filter(p => new Date(p.appliedDate || p.createdAt) >= oneWeekAgo).length;
  const lastWeek = products.filter(p => {
    const d = new Date(p.appliedDate || p.createdAt);
    return d >= twoWeeksAgo && d < oneWeekAgo;
  }).length;

  if (lastWeek > 0 && thisWeek < lastWeek) {
    const dropPct = Math.round(((lastWeek - thisWeek) / lastWeek) * 100);
    if (dropPct >= 25) {
      alerts.push({
        type: 'alert',
        icon: '📉',
        title: `Application velocity dropped ${dropPct}%`,
        body: `You applied to ${thisWeek} positions this week vs ${lastWeek} last week. Momentum matters.`,
      });
    }
  } else if (thisWeek > lastWeek && thisWeek >= 3) {
    insights.push({
      type: 'insight',
      icon: '🚀',
      title: 'Application momentum building',
      body: `${thisWeek} applications this week — up from ${lastWeek} last week. Keep pushing.`,
    });
  }

  // ── 4. Resume Score Detection ─────────────────────────
  if (scoreHistory && scoreHistory.length >= 2) {
    const latest = scoreHistory[scoreHistory.length - 1];
    const prev = scoreHistory[scoreHistory.length - 2];

    const resumeDelta = latest.resumeScore - prev.resumeScore;
    const careerDelta = latest.careerScore - prev.careerScore;

    if (resumeDelta > 0) {
      insights.push({
        type: 'insight',
        icon: '📈',
        title: `Resume Score improved +${resumeDelta}`,
        body: `Your Resume Score moved from ${prev.resumeScore} to ${latest.resumeScore}. AI improvements are working.`,
      });
    } else if (resumeDelta < 0) {
      alerts.push({
        type: 'alert',
        icon: '📉',
        title: `Resume Score dropped ${resumeDelta}`,
        body: `Score went from ${prev.resumeScore} to ${latest.resumeScore}. Re-run Resume AI to diagnose.`,
      });
    }

    if (careerDelta > 5) {
      insights.push({
        type: 'insight',
        icon: '⬆️',
        title: `Career Score surging +${careerDelta}`,
        body: `Career readiness jumped from ${prev.careerScore} to ${latest.careerScore}.`,
      });
    }
  }

  // ── 5. Offer Rate Intelligence ────────────────────────
  if (total >= 10) {
    const offerRate = selected / total;
    if (offerRate < 0.05) {
      recommendations.push({
        type: 'recommendation',
        icon: '🔧',
        title: 'Resume needs optimization',
        body: `Only ${Math.round(offerRate * 100)}% offer rate across ${total} applications. Run Resume AI to identify gaps.`,
      });
    } else if (offerRate >= 0.15) {
      insights.push({
        type: 'insight',
        icon: '🏆',
        title: 'Strong conversion rate',
        body: `${Math.round(offerRate * 100)}% offer rate — well above average. Your profile is competitive.`,
      });
    }
  }

  // ── 6. Rejection Pattern ──────────────────────────────
  if (rejected >= 5 && rejected / total > 0.5) {
    recommendations.push({
      type: 'recommendation',
      icon: '🎯',
      title: 'Refine targeting strategy',
      body: `${Math.round((rejected / total) * 100)}% rejection rate suggests role or skill mismatch. Use Skill Radar to recalibrate.`,
    });
  }

  return { insights, alerts, recommendations };
};

export default generateDashboardInsights;
