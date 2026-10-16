# data

The pages read these CSVs in the browser (`fetch`), so adding a row is all it takes to add a song. Each file needs the header row shown below. Wrap a field in double quotes if it contains a comma.

| file | columns | used on |
|---|---|---|
| `favourites.csv` | `album_art,song_name,artist,youtube_link` | about page carousel |
| `originals.csv` | `album_art,song_name,bpm,length,genre,youtube_link,done` | originals page |
| `remakes.csv` | `original_title,original_youtube_link,remake_title,remake_youtube_link,remake_date` | remakes page |

In `originals.csv`, `done` is `y` (listed under "complete") or `n` (listed under "abandoned"). A blank counts as complete.

`remake_date` is free text, for example `July 2026`. It shows as "remade July 2026" under the original's video. Leave it blank to show nothing.

## Where the album art comes from

**`album_art` is a file name inside `assets/images/`.** Put the image there and write only its name in the CSV, for example `aelyrix.svg` for `assets/images/aelyrix.svg`. Square images work best, since the cards crop the art to a square.

- **`originals.csv`:** the file in `assets/images/` is the only source. If `album_art` is blank, or the file is missing, the card shows a grey-purple placeholder.
- **`favourites.csv`:** the same rule applies first. If `album_art` is blank, the card uses the thumbnail of its `youtube_link` instead (`https://i.ytimg.com/vi/<video id>/hqdefault.jpg`, cropped square). With no art and no link, or if the file is missing, it shows the placeholder.

The album art here is placeholder artwork only. Add the real covers to `assets/images/` yourself.

## Favourites: paste just the link

In `favourites.csv` you can leave `song_name` and `artist` blank and only paste the link:

```
album_art,song_name,artist,youtube_link
,,,https://www.youtube.com/watch?v=Eax2zhVA0Zo
```

When the about page loads, it looks up each blank row with YouTube's public oEmbed service and fills in:

- **song_name:** the video title, minus extras like `(Official Video)`, `[MV]` or `(Lyrics)`.
- **artist:** the channel name, minus ` - Topic`, `VEVO` or `Official`. If the title looks like `Artist - Song`, it is split into the artist and the song instead.

Anything you type in the CSV always wins, so if a lookup comes out wrong, type the correct title or artist in that row. If the lookup fails, for example if YouTube is unreachable, the card shows "untitled" but still links to the video. Links to YouTube Music "Topic" uploads give the cleanest results.

## YouTube links

Use the address-bar watch link, for example `https://www.youtube.com/watch?v=Eax2zhVA0Zo`, not the Share button link. In `remakes.csv`, `remake_youtube_link` can instead be an `.mp3` file name from `assets/audio/` (for example `my-remake.mp3`) to show an audio player.
