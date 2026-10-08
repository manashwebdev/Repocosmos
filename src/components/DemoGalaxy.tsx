"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { demoStars } from "@/lib/layout";
const Galaxy = dynamic(() => import("./Galaxy"), { ssr: false, loading: () => <div className="h-full w-full bg-base" /> });
export default function DemoGalaxy() { const d = useMemo(() => demoStars(), []); return <Galaxy data={d} />; }
