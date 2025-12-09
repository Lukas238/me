# Lucas Dasso - Personal Website

This is a Jekyll theme adapted for my personal website, serving as a digital hub showcasing my professional experience, artistic passions, and personal interests.

Originally based on Chester How's tale-theme (https://github.com/chesterhow/tale), this version has been customized to reflect my unique profile and provide a central point of access to my online presence.

**Key Features:**

*   **About Me:** The main page features a concise overview of my background, skills, and passions.
*   **Professional Links:** Direct links to my GitHub and LinkedIn profiles for exploring my professional work.
*   **Artistic Showcase:** A glimpse into my creative pursuits, including watercolors, woodworking, and more.
*   **Responsive Design:** Ensures optimal viewing experience across various devices.

# Preview

[me.c238.com.ar](me.c238.com.ar)

# Usage

1.  **Fork and clone the repository:**
  ```bash
  git clone git@github.com:Lukas238/me.git
  ```
2.  **Install Jekyll:**
  ```bash
  gem install jekyll
  ```
3.  **Install the theme's dependencies:**
  ```bash
  bundle install --path vendor/bundle
  ```
4.  **Customize the theme:**
  *   Update `_config.yml` with your information.
  *   Modify `index.md` to personalize the "About Me" section.
5.  **Run the Jekyll server:**
  ```bash
  bundle exec jekyll serve
  ```

### Troubleshooting

On Mac with M1 chip, you might need to install the `eventmachine` gem with specific flags:

```bash
gem install eventmachine -v '1.2.7' -- --with-ldflags="-Wl,-undefined,dynamic_lookup"
```

## Structure

*   Here are the main files of the template:

```bash
ap
├── _includes                  # Theme includes
├── _layouts                   # Theme layouts
├── _sass                      # Sass partials
├── assets
|  ├── css                     # Font-awesome and main css
|  ├── fonts                   # Font-Awesome
|  ├── favicon.ico             # Favicon
|  └── img                     # Images used for "about" page
├── _config.yml                # Site configuration
└── index.md                   # About Me content
```

## Configure Your Website

Open `_config.yml` in a text editor to customize the website's settings.

### Site Configuration

Configure Jekyll with your website title, URL, and other settings:

```yml
title: Lucas Dasso
baseurl: "" # Leave empty if your site is at the root
url: me.c238.com.ar
google_analytics: "" # Add your Google Analytics Tracking ID if you want to use it
```

### About You

Meta variables hold basic information about your profile. Change these variables in `_config.yml`:

```yml
author:
name: Lucas Dasso
desc: Tech Lead & Fullstack Developer | Artist | Enthusiast
email: "" # Optional
selfie: "" # Path to your avatar image
```

### SNS Information

This section is no longer used. The links to my GitHub and LinkedIn are now directly in the "About Me" section.

## License

[The MIT License (MIT)](https://raw.githubusercontent.com/kssim/ap/master/LICENSE)


## Respurces

https://github.com/Shopify/liquid/wiki/Liquid-for-Designers
