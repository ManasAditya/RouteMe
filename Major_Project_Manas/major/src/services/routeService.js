import { supabase } from "../supabaseClient";

export async function getRoutes(userId) {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createRoute(route) {
  const { data, error } = await supabase
    .from("routes")
    .insert(route)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoute(id, values) {
  const { data, error } = await supabase
    .from("routes")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoute(id) {
  const { error } = await supabase
    .from("routes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function addAnalytics(data) {
  const { error } = await supabase
    .from("travel_analytics")
    .insert(data);

  if (error) throw error;
}

export async function getTravelAnalytics(userId) {
  const { data, error } = await supabase
    .from("travel_analytics")
    .select("*")
    .eq("user_id", userId)
    .order("travel_date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getExpenses(userId) {
  const { data, error } = await supabase
    .from("travel_analytics")
    .select("cost_incurred, travel_date, transit_type, minutes_spent")
    .eq("user_id", userId)
    .order("travel_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPlannedTrips(userId) {
  const { data, error } = await supabase
    .from("planned_trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPlannedTrip(trip) {
  const { data, error } = await supabase
    .from("planned_trips")
    .insert(trip)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlannedTrip(id) {
  const { error } = await supabase
    .from("planned_trips")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getRoutesWithExpenses(userId) {
  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (routesError) throw routesError;

  const { data: analytics, error: analyticsError } = await supabase
    .from("travel_analytics")
    .select("route_id, cost_incurred, minutes_spent")
    .eq("user_id", userId);

  if (analyticsError) throw analyticsError;

  const analyticsMap = {};
  (analytics || []).forEach(a => {
    analyticsMap[a.route_id] = a;
  });

  return (routes || []).map(route => ({
    ...route,
    cost_incurred: analyticsMap[route.id]?.cost_incurred || 0,
    minutes_spent: analyticsMap[route.id]?.minutes_spent || 0
  }));
}
