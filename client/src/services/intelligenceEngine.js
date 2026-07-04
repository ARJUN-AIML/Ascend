export const generateIntelligence = (products, user) => {
  const total = products.length;
  const interviews = products.filter(p => ['OA', 'Interview', 'Selected'].includes(p.status)).length;
  const offers = products.filter(p => p.status === 'Selected').length;
  
  const responseRate = total ? Math.round((interviews / total) * 100) : 0;
  
  // Calculate app velocity (this week vs last week)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const currentWeekApps = products.filter(p => new Date(p.appliedDate || p.createdAt) >= oneWeekAgo).length;
  const previousWeekApps = products.filter(p => {
    const d = new Date(p.appliedDate || p.createdAt);
    return d >= twoWeeksAgo && d < oneWeekAgo;
  }).length;

  let bottleneck = "Build application volume";
  if (total > 15 && interviews === 0) bottleneck = "Low interview conversion";
  else if (interviews > 3 && offers === 0) bottleneck = "Interview performance";
  else if (total > 0 && total <= 15) bottleneck = "Low application volume";
  else if (total === 0) bottleneck = "No pipeline activity";
  
  const targetRole = user?.careerProfile?.targetRole || 'Software Engineer';
  const focus = `${targetRole} Hunt`;

  const feed = [];
  if (responseRate < 15 && total >= 10) {
    feed.push({ type: 'alert', text: `Application response rate is weak (${responseRate}%)` });
  }
  if (currentWeekApps < previousWeekApps && previousWeekApps > 0) {
    feed.push({ type: 'alert', text: `Application velocity dropped (${currentWeekApps} vs ${previousWeekApps} last week)` });
  } else if (currentWeekApps > previousWeekApps) {
    feed.push({ type: 'insight', text: `Great momentum! ${currentWeekApps} apps this week.` });
  }

  // platform calculation
  const platformStats = {};
  products.forEach(p => {
    const pl = p.platform || 'Direct';
    if (!platformStats[pl]) platformStats[pl] = { total: 0, responded: 0 };
    platformStats[pl].total++;
    if (['OA', 'Interview', 'Selected'].includes(p.status)) platformStats[pl].responded++;
  });
  
  const platforms = Object.keys(platformStats).filter(k => platformStats[k].total >= 3);
  if (platforms.length >= 2) {
    const sorted = platforms.sort((a,b) => (platformStats[b].responded/platformStats[b].total) - (platformStats[a].responded/platformStats[a].total));
    if (platformStats[sorted[0]].responded > 0 && (platformStats[sorted[0]].responded/platformStats[sorted[0]].total) > 0.2) {
      feed.push({ type: 'insight', text: `${sorted[0]} is outperforming other platforms for you.` });
    }
  }

  if (feed.length === 0 && total === 0) {
    feed.push({ type: 'recommendation', text: 'Add your first 5 applications to unlock deeper insights.' });
  } else if (feed.length < 3) {
      if (interviews === 0) feed.push({ type: 'recommendation', text: 'Optimize resume keywords for ATS.' });
      else feed.push({ type: 'recommendation', text: 'Run a mock interview to improve conversion.' });
  }

  return {
    focus,
    bottleneck,
    weeklyGoal: total === 0 ? "Add first application" : currentWeekApps < 5 ? "Apply to 10 quality roles" : "Maintain pipeline momentum",
    recommendation: interviews > 0 && offers === 0 ? "Run a mock interview to improve conversion" : "Optimize resume keywords for ATS",
    feed: feed.slice(0, 4) // max 4 items
  };
};

export const generateTimeline = (products) => {
  const timeline = [];
  products.forEach(p => {
    timeline.push({
      id: `add-${p._id}`,
      type: 'added',
      text: `Added ${p.companyName} application`,
      date: new Date(p.createdAt || p.appliedDate || new Date())
    });
    
    if (p.status === 'Interview' || p.status === 'Selected') {
      timeline.push({
        id: `int-${p._id}`,
        type: 'progress',
        text: `Moved to Interview at ${p.companyName}`,
        date: new Date(new Date(p.createdAt || new Date()).getTime() + 86400000) // mock progression date for timeline
      });
    }
  });
  
  timeline.sort((a, b) => b.date - a.date);
  return timeline.slice(0, 15);
};
