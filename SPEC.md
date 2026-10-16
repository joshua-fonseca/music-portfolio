# a music portfolio site

# languages

plain HTML, CSS and JS

# theme

in the wireframes/ folder, there is a theme.png with information on the hex codes for colour and font names

# pages (from wireframe)

## landing_page

the navbar on top right, on desktop when hovering over the text, the word turns into the lighter purple colour
when clicking on the light mode icon, switch the icon to a moon and reverse the colour palette. instead of white make it the dark purple and then the dark purple will be white.

when hovering over the "more about me button" it will also turn into the lighter purple colour

the footer on the landing page (the purple bar with the three streaming platforms, along with the copyright and contact / github) will be present on ALL pages

here are the links for each respective streaming platform:
- https://music.apple.com/kh/artist/kkura/1866697057
- https://music.youtube.com/channel/UCB5h9HWq8Eqe_je_BqlwmBg
- https://open.spotify.com/album/6RCnxNY1koPV3VsfPXBaK1

github link:
- https://github.com/joshua-fonseca

## landing_page_click_contact

the page will dim, and there will be a pop up box in the middle with my email that is clickable
email is:
- jfonse01@uoguelph.ca

there is an x on the box, top right that will close that pop up

# about me (and about me 2)

in the "some of my favourite songs" section, the song cards will actually be slowly automatically scrolling left to right. the user can swipe/click and drag to scroll in the same direction or opposite direction. the user can also tap/click on the album art on the song card to get to the song on youtube

if possible, i'd want the information to be fetched from a csv file via js, so that i wont have to dive into the html to add my favourite songs. format of the csv would be song_name,artist,youtube_link. these csv files should be placed in a folder, the folder name is up to you. CSVs have a header row, and fields may be quoted if they contain commas. Parse them properly.

if there are not enough songs to span the whole width of the screen, then the same songs may be duplicated to fill the space. if all songs have been scrolled through, loop the songs from the first song so it is seamless

# originals

again, if possible, i'd want the information to be fetched from a csv file via js, so that i wont have to dive into the html to add my original songs. format of the csv would be album_art(from images folder),song_name,bpm,length,genre,youtube_link

youtube links will be taken from the address bar/watch link, i.e., https://www.youtube.com/watch?v=Eax2zhVA0Zo and not via the share button below the videos

that information will populate the card and the youtube link will generate the embed

simple layout, its the song card beside the youtube embed - they are the same height and are centered on the page.

# remakes

again, if possible, i'd want the information to be fetched from a csv file via js, , so that i wont have to dive into the html to add my remakes. format of the csv would be original_title,original_youtube_link,remake_title,remake_youtube_link OR an audio file (.mp3) from assets (will have to make a new folder in assets called audio)

that information will populate the header and embed of the original, with the remake (not gonna use the title, but might use that data later) and youtube embed of the remake/audio embed

# responsive-design (landing_page_mobile)

i have a wireframe for smaller views such as mobile devices too - see landing_page_mobile
- the nav bar will instead be one button, a hamburger icon and the text "menu". once that is tapped, the menu will fade to the purple colour and the text will also fade to white. three buttons will slide from under the menu and be stacked under the menu. it is the exact buttons for the original navbar.
- the 3 links for my channel (spotify, yt music, and apple music) will be stacked instead of being side by side
- the copyright and contact / github info will also be stacked as seen
- the page should be able to support multiple screen sizes, ie i use ultrawide and i notice some websites dont treat it nicely

# accessibility

- ensure the website is accessible when possible, ie for keyboard only, and screen readers and such
- Hover effects need matching :focus-visible styles so keyboard users see the same thing.
- The carousel should pause on hover and focus, and respect prefers-reduced-motion. Auto-moving content is one of the biggest accessibility issues.
- Duplicated cards used for the seamless loop should be aria-hidden so screen readers don’t read every song twice.
- The contact popup needs focus trapping and should return focus to its trigger when closed.
- The hamburger needs aria-expanded, and the theme toggle needs a proper label.
- Each YouTube iframe needs a title.
