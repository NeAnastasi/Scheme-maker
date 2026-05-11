import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
const useUnreadCounts = (enabled = true) => {
  const [counts, setCounts] = useState({
    applications: 0,
    roomRequests: 0,
    layoutProposals: 0,
  });

  useEffect(() => {
    if (!enabled) {
      setCounts({ applications: 0, roomRequests: 0, layoutProposals: 0 });
      return;
    }
    const fetchCounts = async () => {
      const [appsRes, reqsRes, propsRes] = await Promise.all([
        supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("room_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("layout_proposals")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      setCounts({
        applications: appsRes.count || 0,
        roomRequests: reqsRes.count || 0,
        layoutProposals: propsRes.count || 0,
      });
    };

    fetchCounts();
    const channel = supabase
      .channel("admin-unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        fetchCounts
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_requests" },
        fetchCounts
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layout_proposals" },
        fetchCounts
      )
      .subscribe();
    window.addEventListener("focus", fetchCounts);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", fetchCounts);
    };
  }, [enabled]);

  return counts;
};

export default useUnreadCounts;
