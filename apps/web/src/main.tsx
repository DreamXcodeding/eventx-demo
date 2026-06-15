import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { EVENTS } from "./data/events";
import i18n from "./i18n";
import { useUiStore } from "./stores/uiStore";
import ScrollToTop from "./components/ScrollToTop";

// ตั้งภาษาเริ่มต้น + sync เมื่อสลับภาษาผ่าน uiStore
i18n.changeLanguage(useUiStore.getState().locale);
useUiStore.subscribe((s) => {
  if (i18n.language !== s.locale) i18n.changeLanguage(s.locale);
});
import LoginModal from "./components/LoginModal";
import HomePage from "./pages/HomePage";
import EventDetailPage from "./pages/EventDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import CheckinPage from "./pages/CheckinPage";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentBooking from "./pages/agent/AgentBooking";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminOrganizers from "./pages/admin/AdminOrganizers";
import AdminUsers from "./pages/admin/AdminUsers";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import AffiliateLinks from "./pages/affiliate/AffiliateLinks";
import AffiliateApply from "./pages/affiliate/AffiliateApply";

// มีงานเดียว → ใช้หน้า detail ของงานนั้นเป็นหน้าแรกเลย
// พอมีงานเพิ่ม (EVENTS > 1) จะกลับไปแสดง HomePage (marketplace) อัตโนมัติ
const Landing = () =>
  EVENTS.length === 1 ? <Navigate to={`/events/${EVENTS[0].slug}`} replace /> : <HomePage />;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ScrollToTop />
      <LoginModal />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* หน้า marketplace (หลาย event) — เปิดดูได้เสมอแม้ตอนนี้มีงานเดียว */}
        <Route path="/ecn" element={<HomePage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
        <Route path="/checkin" element={<CheckinPage />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/book" element={<AgentBooking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/organizers" element={<AdminOrganizers />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/events" element={<OrganizerEvents />} />
        <Route path="/affiliate" element={<AffiliateDashboard />} />
        <Route path="/affiliate/apply" element={<AffiliateApply />} />
        <Route path="/affiliate/links" element={<AffiliateLinks />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
