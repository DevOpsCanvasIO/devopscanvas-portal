import React, { useEffect, useState } from 'react';

type Score = { service: string; updatedAt: string; dimensions: Record<string, number>; grade: string };

export default function Scorecards({ service = 'hello-canvas' }: { service?: string }){
  const [data, setData] = useState<Score|null>(null);
  const base = (window as any).appConfig?.scorecards?.apiBaseUrl || (process.env.SCORECARDS_API || '');
  useEffect(()=>{
    fetch(`${base}/api/scorecards/${service}`).then(r=>r.json()).then(setData).catch(()=>setData(null));
  },[service]);
  if(!data) return <div>Loading scorecard…</div>;
  const rows = Object.entries(data.dimensions);
  return <div>
    <h3>Scorecard: {data.service} ({data.grade})</h3>
    <ul>{rows.map(([k,v])=> <li key={k}>{k}: {(v*100).toFixed(0)}%</li>)}</ul>
    <small>Updated {new Date(data.updatedAt).toLocaleString()}</small>
  </div>;
}
