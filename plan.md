# ECN - Event Connect Network

## Project Vision

ECN (Event Connect Network) คือแพลตฟอร์ม Event Distribution Network ที่เชื่อมต่อ Customer, Agent, Affiliate, Organizer และ Sponsor ไว้ในระบบเดียว

ECN ไม่ใช่เพียง Ticketing Platform แต่เป็นระบบ Distribution และ Commerce Platform สำหรับอุตสาหกรรม Event และ Tourism

ระบบออกตัว จะใช้ขื่อว่า EventX
ระบบจัดการ จะใช้ชื่อว่า ECN

---

# Build Status — Demo Phase (อัปเดต 2026-06-13)

> เฟสปัจจุบัน: **Frontend-only + Mock data** (สลับเป็น API จริงภายหลังผ่าน `VITE_USE_MOCK`)
> Stack: React + Vite + TypeScript + TailwindCSS v4 + Zustand + Axios · ฟอนต์ **Noto Sans Thai**
> ธีม: **Prismatic Pay** (ม่วงอ่อน/กรมท่า สไตล์ Stripe)

## ภาษา (Languages)

* รองรับ **TH / EN เท่านั้น** (เอาภาษาจีน zh ออกแล้ว) · ค่าเริ่มต้น TH

## อีเวนต์ใน Mock ปัจจุบัน

* มีงานเดียว: **CNX Loy Krathong 2026** (`/events/cnx-loy-krathong-2026`) · ราคาเดียว 9,800 บาท

## พฤติกรรมหน้าแรก (Landing)

* **มีงานเดียว → `/` redirect ไปหน้า Event Detail ของงานนั้นเลย** (ทำหน้า detail เป็นหน้าแรก)
* **พอมีงานเพิ่ม (EVENTS > 1) → กลับไปแสดง HomePage (marketplace) อัตโนมัติ** ไม่ต้องแก้โค้ด
* ตรรกะอยู่ที่ `apps/web/src/main.tsx` (component `Landing`)

## โมดูลที่ทำเสร็จแล้ว (Demo)

* Public: Home (carousel/cards/FAQ), Event Detail, Ticket Picker, Checkout (state machine + hold 15 นาที), My Tickets (QR + รูปงาน)
* Agent Portal: Dashboard, Create Booking (ออกตั๋วทันที)
* Affiliate Portal: สมัคร → Dashboard เดียวกัน (โชว์ user ที่แนะนำมา) + Referral Links
* Organizer Portal: Dashboard (GMV/net หลังหัก fee), My Events
* Admin Portal: Dashboard, Events (INTERNAL), Organizers (อนุมัติ + ตั้ง fee %), Users
* Check-in: สแกน QR ด้วยกล้อง + กรอกเลขบัตร (single-use)
* i18n ครบทุกหน้า (customer + staff) · Login modal (บังคับ login ก่อนซื้อ) · redirect ตาม role

## Organizer Onboarding Model

* **INTERNAL** — admin ลงงานเอง (EventX จัดหามา)
* **PARTNER** — organizer สมัครเอง, admin อนุมัติแล้วตั้งค่าดำเนินการ (fee %)

---

# Core Differentiation

## Klook

* Marketplace
* OTA
* Ticket Sales

## Agoda

* Hotel Booking
* Travel Services

## ECN

* Event Distribution Network
* Direct Sales
* Agent Booking
* Affiliate Network
* Organizer CRM
* Sponsor Marketplace

---

# Business Channels

## ECN Direct

ลูกค้าซื้อบัตรเองผ่านเว็บไซต์

Flow:

Customer
→ Event
→ Payment Gateway
→ QR Ticket
→ Email Customer

Payment:

* PromptPay
* Credit Card
* Alipay
* WeChat Pay

---

## ECN Agent

Agent สามารถจองตั๋วแทนลูกค้าได้

Flow:

Agent Login
→ Create Booking
→ Customer Information
→ Issue Ticket
→ Email Customer
→ Email Copy Agent

Customer Fields:

* Full Name
* Email
* Phone Number

Agent Fields:

* Agent Name
* Company Name
* Email

Ticket:

* Ticket จริงส่งให้ Customer
* Ticket Copy ส่งให้ Agent

System:

* เก็บข้อมูลลูกค้า
* เก็บข้อมูล Agent
* เก็บข้อมูล Order
* รองรับ Settlement ภายหลัง

---

## ECN Affiliate

Affiliate ไม่สามารถออกตั๋วได้

Flow:

Affiliate
→ Referral Link
→ Customer Purchase
→ Commission

Example:

https://ecn.co.th/event/cnx2026?ref=AFF001

---

# User Roles

## Customer

ซื้อบัตร

## Agent

จองแทนลูกค้า

## Affiliate

แชร์ลิงก์รับค่าคอมมิชชั่น

## Organizer

สร้างและจัดการ Event

## Sponsor

ซื้อ Sponsor Package

## Admin

จัดการระบบ

---

# Product Modules

## Public Website

### Home

* Hero Banner
* Search Event
* Categories
* Featured Events
* Upcoming Events
* Popular Events

### Event Listing

* Search
* Filter by Province
* Filter by Category
* Filter by Date
* Filter by Price

### Event Detail

* Banner
* Gallery
* Video
* Description
* Schedule
* Map
* FAQ
* Terms

### Ticket Purchase

* Select Date
* Select Session
* Select Ticket Type
* Quantity

### Checkout

* Customer Information
* Coupon
* Payment

### My Tickets

* Ticket List
* QR Ticket
* PDF Download
* Check-in Status

---

# Organizer Portal

## Dashboard

* Revenue
* Orders
* Check-ins
* Ticket Inventory

## Event Management

* Create Event
* Edit Event
* Publish Event
* Archive Event

## Ticket Management

* VIP
* Premium
* Standard
* Group Ticket

## Orders

* Customer List
* Export Excel

## Check-in

* QR Scan
* Attendance Report

---

# Agent Portal

## Dashboard

* Bookings
* Customers
* Outstanding

## Create Booking

* Select Event
* Select Ticket
* Enter Customer Information
* Issue Ticket

## Customer Management

* Customer List
* Booking History

---

# Affiliate Portal

## Dashboard

* Clicks
* Orders
* Revenue
* Commission

## Referral Links

* Create Link
* QR Referral

## Withdraw

* Bank Account
* Withdraw Request
* Withdraw History

---

# Sponsor Portal

## Dashboard

* Campaigns
* Leads
* Analytics

## Sponsor Packages

* Gold
* Silver
* Bronze

---

# Admin Portal

## Dashboard

* GMV
* Revenue
* Events
* Users
* Agents
* Affiliates

## User Management

* Customers
* Agents
* Affiliates
* Organizers

## Event Approval

* Pending
* Approved
* Rejected

## Settlement

* Organizer Settlement
* Agent Settlement
* Affiliate Settlement

---

# Event Model

Event
├── Sessions
├── Ticket Types
├── Orders
├── Tickets
├── Check-ins
├── Affiliates
└── Sponsors

---

# Ticket Types

Each Event Supports:

* VIP
* Premium
* Standard
* Group
* Early Bird
* Complimentary

---

# Booking Types

## DIRECT

Customer Purchase

## AGENT

Agent Booking For Customer

## AFFILIATE

Affiliate Referral Order

---

# UI/UX Principles

The platform must be:

* Premium
* Modern
* Luxury
* Fast
* Mobile First

Inspired by:

* Apple
* Airbnb
* Klook
* Stripe
* Linear

Goals:

* Customer can buy ticket within 2 minutes
* Agent can issue ticket within 1 minute
* Organizer can see sales within 10 seconds

---

# MVP Scope (Phase 1)

Must Have:

* Event Listing
* Event Detail
* Direct Booking
* Agent Booking
* Payment Gateway
* QR Ticket
* My Tickets
* Organizer Portal
* Admin Portal
* Check-in System

Out of Scope:

* Sponsor Marketplace
* OTA Integration
* Hotel Booking
* CRM Automation

These modules will be Phase 2 and Phase 3.
