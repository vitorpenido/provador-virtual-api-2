# Virtual Try-On App

## Overview

This is a fashion tech application that provides a virtual try-on experience. Users can upload a clothing item and a photo of themselves, and the app will create a realistic visualization of how the clothing would look when worn. The application focuses on simplicity, speed, and accessibility without requiring user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## Product Vision

Fashion retail application that enables virtual try-on functionality for clothing stores and customers. The MVP focuses on core image manipulation features with a minimalist, elegant interface optimized for both desktop and mobile devices.

## System Architecture

### Frontend Architecture

The frontend is built using React 18 with TypeScript and follows a component-based architecture:

- **UI Framework**: Uses shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with a light, fashion-tech theme using whites, soft grays, and elegant typography
- **Image Processing**: Fabric.js for client-side image manipulation and overlay functionality
- **State Management**: Local React state for image processing workflow
- **File Structure**: Clean separation with components focused on upload, preview, and download functionality

### Design System

- **Colors**: White background (#FFFFFF), light gray (#F5F5F5), black accents (#000000), blue highlights (#3B82F6)
- **Typography**: Clean sans-serif fonts (Inter) with generous spacing
- **Components**: Large rounded buttons, subtle shadow cards, centered preview areas
- **Layout**: Minimalist fashion tech aesthetic with focus on visual clarity

### Core Features

1. **Dual Image Upload**: Separate upload areas for clothing items and person photos
2. **Automatic Processing**: Background removal for clothing items with smart overlay positioning
3. **Real-time Preview**: Interactive preview showing the combined result
4. **Download Functionality**: Save final images locally without requiring accounts
5. **Mobile Optimization**: Responsive design optimized for touch interfaces

### Technical Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Image Processing**: Fabric.js for canvas manipulation and image overlay
- **File Handling**: HTML5 File API for local image processing
- **Build System**: Vite for fast development and building
- **Deployment**: Optimized for Replit deployment with minimal backend dependencies

### Architecture Principles

- **Client-Side First**: All image processing happens in the browser for speed and privacy
- **No Authentication**: Streamlined experience without user accounts or login requirements
- **Mobile-First**: Responsive design prioritizing mobile user experience
- **Performance**: Optimized image handling and processing for quick results
- **Accessibility**: Clean, readable interface with proper contrast and touch targets

The architecture prioritizes user experience, performance, and simplicity while maintaining professional image processing capabilities suitable for fashion retail applications.