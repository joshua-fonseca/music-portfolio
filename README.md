# music-portfolio

> a rhythm game hobbyist making music.

A small, portfolio site for my music.

<img width="1890" height="1028" alt="image" src="https://github.com/user-attachments/assets/98ea03bb-34b2-40b5-b661-19ae4b628326" />

## Installing / Getting started

There is nothing to install. The pages load their song lists with `fetch`, which browsers block on `file://` URLs, so serve the folder over HTTP instead of double-clicking `index.html`:

```shell
git clone https://github.com/joshua-fonseca/music-portfolio.git
cd music-portfolio
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Any static file server works in place of Python's.

### Initial configuration

To put your own music on the site, edit the CSV files in [`data/`](data/) and drop album art into `assets/images/`. The columns, the album art rules and the paste-a-YouTube-link shortcut are all explained in [`data/README.md`](data/README.md).

## Developing

### Built with

- HTML, CSS and vanilla JavaScript (ES modules). No framework, bundler or `package.json`
- [Cascadia Mono](https://github.com/microsoft/cascadia-code) (Light and Regular), self-hosted as `.woff2`

### Prerequisites

- A modern browser (the site uses ES modules and the `<dialog>` element)
- Any static file server, for example Python 3's `http.server`

### Setting up Dev

Clone the repo and start a server as shown in [Installing / Getting started](#installing--getting-started). Edit a file and refresh the page; there is nothing to compile.

```
index.html, about.html,
originals.html, remakes.html   the four pages
css/styles.css                 all styling and theme tokens
js/shell.js                    shared navbar, footer and popups
js/csv.js                      small CSV loader
js/youtube.js                  link parsing, thumbnails, YouTube lookups
js/originals.js, remakes.js,
js/favourites.js               page logic
data/                          CSV content for each page
assets/                        fonts, images and the favicon
wireframes/                    the original design mockups
```

### Building

No build step. The files in the repo are the files that get served.

### Deploying / Publishing

Publish the repository root to any static host. GitHub Pages is enabled on this repository, and nothing in the project needs a server.

## Features

- **Originals page:** each song shows its BPM, length and genre, and is listed as complete or abandoned. Songs without album art get a clear placeholder
- **Remakes page:** pairs each remake with the original it is based on, with an optional "remade" date. A remake can be a YouTube link or an `.mp3` file
- **Favourites carousel:** on the about page, with a pause/play button and mouse and keyboard control
- **Paste-a-link favourites:** give a YouTube link and the title, artist and thumbnail are looked up for you. Anything you type in the CSV takes priority
- **Click-to-play videos:** YouTube videos show a thumbnail first and only load the player on click. If a video can't be played, a "watch on YouTube" link appears instead
- **Accessible by default:** skip link, labelled navigation, popups that trap focus and return it on close, and a notice for links that open in a new tab
- **Responsive navigation** with a mobile menu
- **Scraper-resistant contact:** the email address is assembled in JavaScript instead of being written in the HTML

Dark mode is not finished yet. The toggle is in place but currently shows a "not implemented yet" notice.

## Configuration

There are no environment variables or config files. Everything is edited in place:

- **Songs:** `data/favourites.csv`, `data/originals.csv` and `data/remakes.csv` (see [`data/README.md`](data/README.md))
- **Album art:** image files in `assets/images/`, referenced by file name from the CSVs
- **Streaming links, GitHub link and contact address:** the `LINKS` and `EMAIL_PARTS` constants at the top of `js/shell.js`
- **Colours and spacing:** the theme tokens at the top of `css/styles.css`

## Contributing

This is a personal portfolio, so I'm not looking for code contributions. Bug reports and suggestions are welcome: please [open an issue](https://github.com/joshua-fonseca/music-portfolio/issues) describing what you saw.

You're free to fork the project as a starting point for your own site under the MIT license. If you do, please replace the personal content (name, links, songs and album art) with your own.

## Links

- Repository: <https://github.com/joshua-fonseca/music-portfolio>
- Issue tracker: <https://github.com/joshua-fonseca/music-portfolio/issues>
- Apple Music: <https://music.apple.com/kh/artist/kkura/1866697057>
- YouTube Music: <https://music.youtube.com/channel/UCB5h9HWq8Eqe_je_BqlwmBg>
- Spotify: <https://open.spotify.com/artist/2cuFqV91fw2pcqE7h6fljM>

## Licensing

The code in this project is licensed under the MIT license; see [`LICENSE`](LICENSE).

The Cascadia Mono font files in `assets/fonts/` are licensed under the SIL Open Font License, Version 1.1; see [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt).
