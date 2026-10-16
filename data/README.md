# data

The pages read these CSVs in the browser (`fetch`), so adding a row is all it takes to add a song. Each file needs the header row shown below. Wrap a field in double quotes if it contains a comma.

| file | columns | used on |
|---|---|---|
| `favourites.csv` | `album_art,song_name,artist,youtube_link` | about page carousel |
| `originals.csv` | `album_art,song_name,bpm,length,genre,youtube_link` | originals page |
| `remakes.csv` | `original_title,original_youtube_link,remake_title,remake_youtube_link` | remakes page |

## Where the album art comes from

**`album_art` is a file name inside `assets/images/`.** Put the image there and write only its name in the CSV, for example `aelyrix.svg` for `assets/images/aelyrix.svg`. Square images work best, since the cards crop the art to a square.

- **`originals.csv`:** the file in `assets/images/` is the only source. If `album_art` is blank, or the file is missing, the card shows a grey-purple placeholder.
- **`favourites.csv`:** the same rule applies first. If `album_art` is blank, the card uses the thumbnail of its `youtube_link` instead (`https://i.ytimg.com/vi/<video id>/hqdefault.jpg`, cropped square). With no art and no link, or if the file is missing, it shows the placeholder.

The album art here is placeholder artwork only. Add the real covers to `assets/images/` yourself.

## YouTube links

Use the address-bar watch link, for example `https://www.youtube.com/watch?v=Eax2zhVA0Zo`, not the Share button link. In `remakes.csv`, `remake_youtube_link` can instead be an `.mp3` file name from `assets/audio/` (for example `my-remake.mp3`) to show an audio player.
