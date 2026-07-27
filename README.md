# Wiki Builder

A customizable, self-hosted wiki creation tool built with **Express.js** and **MongoDB**. Wiki Builder allows you to create, manage, and organize multiple independent wikis, each with its own pages, appearance, and settings.

Designed for local use, the application makes it easy to build structured documentation with an intuitive parent-child page hierarchy, rich page editing, and interactive visualization tools.

---

## Features

### Multiple Independent Wikis
- Create an unlimited number of separate wikis.
- Delete wikis when they are no longer needed.
- Switch between existing wikis from the home menu.
- Each wiki maintains its own pages and settings.

---

## Wiki Navigation

Every wiki is organized as a tree.

- The **Home** page serves as the root of the wiki.
- Any page whose parent is **--root--** automatically appears in the navigation bar.
- Child pages can themselves contain additional child pages, allowing arbitrarily deep hierarchies.

The navigation bar also contains:

- **Wiki Logo**
- **Search Bar**
- **Create a Page**
- **See All Pages**
- **Settings**

---

## Search

A built-in search bar allows users to quickly locate pages or terms within the current wiki.

---

## Interactive Graph View

Selecting **See All Pages** displays an interactive graph representing the wiki hierarchy.

Features include:

- Starts at the Home page
- Clicking a node reveals its children
- Double-clicking a node opens the corresponding page
- Makes navigating large wikis significantly easier

---

## Wiki Management

The Wiki Builder home menu allows you to:

- Select an existing wiki
- Create a new wiki
- Delete a wiki
- Open Wiki Settings

---

## Wiki Settings

Each wiki includes its own settings page.

Available options include:

### Website Graph
Displays the complete page hierarchy.

### Link Graph
Shows links between pages throughout the wiki.

### Page Size Statistics
Displays every page sorted by document size.

Sorting can be ascending or descending.

### Appearance

Customize the wiki by uploading:

- Background image
- Site logo

Images are stored locally for fast loading.

---

# Creating Pages

Each page requires:

- Unique title
- Short bio / description

Every page also contains a **Cover** section positioned near the top-right.

The cover section can contain:

- Image
- Label/value information pairs
- Cover section titles

---

## Automatic Table of Contents

Every page automatically generates a table of contents from its headers.

Supported header levels:

- Level 1
- Level 2
- Level 3

This allows readers to quickly navigate large pages.

---

## Editing Pages

Pages can be edited at any time.

Editable components include:

- Title
- Bio
- Cover information
- Every content section

Every page also includes:

- Edit button
- Delete button

The exception is the **Home** page, which cannot be deleted.

---

# Page Sections

The primary content of a page is divided into sections.

Each section has its own header and can contain any combination of the following components:

- Headers (Levels 2 and 3)
- Images
- Unordered lists
- Numbered lists
- Links to other wiki pages
- Large text bodies

There is a control panel which allows you to add each component, and it also allows you to control the cursor that indicates where an element is inserted.

When linking to another page, its cover image is used as a visual reference.

Components and entire sections can be removed at any time.

> **Current limitation:** Items within lists cannot be rearranged, and insertion is fixed at the end.

---

# Storage

Wiki Builder uses two storage systems:

### MongoDB

Stores:

- Wikis
- Pages
- Parent-child relationships
- Cover information
- Section content
- Metadata

### Local File Storage

Stores uploaded images such as:

- Page images
- Cover images
- Background images
- Logos

Separating images from the database keeps retrieval simple and efficient.

---

# Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- HTML
- CSS
- JavaScript

---

# Highlights

- Multiple independent wikis
- Parent-child page hierarchy
- Automatic navigation generation
- Interactive page graph
- Link visualization graph
- Full page editor
- Automatic table of contents
- Built-in search
- Custom logos
- Custom backgrounds
- Local image storage
- MongoDB document storage
- Easy creation, editing, and deletion of pages