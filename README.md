# Persona Matcher AI

A smart bag recommendation system that matches your personality and style preferences with the perfect handbag.

## 🚀 Quick Start (Lovable Style)

Just run one command:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001

## 🎯 What It Does

1. **Take a Personality Quiz** - Answer questions about your style preferences
2. **Advanced Personality Quiz** - Dynamic questions that adapt based on your answers using CSV data
3. **Get Smart Recommendations** - AI-powered bag suggestions based on your personality
4. **Upload Images** - Get recommendations based on your outfit photos
5. **Browse Results** - See detailed product information and explanations

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI**: Gemini API for intelligent recommendations
- **Data**: Excel-based product database

## 📁 Project Structure

```
├── src/                 # Frontend React app
├── server/             # Backend API
├── mapped_persona_artwork_data.xlsx  # Product database with proper mapping
└── package.json        # Single command to run everything
```

## 🎨 Features

- **Personality-Based Matching**: Quiz-driven recommendations
- **Advanced Personality Quiz**: Dynamic questions that adapt based on previous answers
- **CSV Data Integration**: Uses real personality dataset for accurate matching
- **Visual Style Matching**: Upload outfit photos
- **Smart AI Explanations**: Why each bag matches your style
- **Product Database**: 755+ handcrafted leather bags
- **Responsive Design**: Works on all devices

## 🔧 Development

The project is designed to be **Lovable-friendly** - just one command runs everything!

```bash
npm run dev  # Runs both frontend and backend
```

No complex setup, no multiple terminals, no confusion! 🎉

## 🔧 Environment Configuration

To run the application, set up the following environment variables:

```bash
# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://match_maker_user:ca22KPpezwg7b6MpN84qmI4GExGoCBCs@dpg-d2940m7diees73fit0g0-a.singapore-postgres.render.com/match_maker

# Gemini API Key (for personality analysis)
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=3001
```
