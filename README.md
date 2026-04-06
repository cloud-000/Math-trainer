# Math Problem
## Goals
A systemic storage of problems from variety of high quality contests, making grinding and exploring problem simple.
## Current State
Currently working on collecting problems from AoPs and Supabase's PostgreSQL database,
## Updating Problems
The primary source of problems are from AoPs Community, it's various collections.
[C13](https://artofproblemsolving.com/community/c13_contests) are a good source, but any Collection/Forum on AoPs works.\
For Instance, the script can also scrape problems from [USA Mocks Collection](https://artofproblemsolving.com/community/c2439870_usa_mocks) for another source of problems\
Big thanks to parmenides51 for organizing the problems in collections.
```
let f = new ForumSession()
await f.sendRequest(ForumSession.payload(FETCH_.CATEGORY_DATA, THE_CONTEST_ID))
```
It also partial-supports scraping from collections where a single post contains many problems numbered, such as [2020 Halloween Mock AMC 8](https://artofproblemsolving.com/community/c1514808_2020_halloween_mock_amc_8). This feature currently works for only numeric labels, it had a different formatting like a, b, c, or p1, p2, p3, ... are not supported right now.

Issues that may arise, is duplicate problems with differing ids, (same problem, two different posts) along with native asymptote integration, although I will simply use pre rendered images for the time being.\
I am also unsure on how to update the dataset of problems (after I put it on the database), when I run the scraper again to update problems, but need to sync it again.

## Future Ideas
- User Problem History / Stats
- Mock Contest Integration
- Mathcounts Countdown Simulation (FTW esque)
- Contest Simulation (Timer)
- Problem Generator
- Problem Search
    - Metadata
        - type (ACGN)
        - Contest
        - Quality
        - Difficulty
    - Advanced querying
- Elo ranking for problems and users
- Organization structure