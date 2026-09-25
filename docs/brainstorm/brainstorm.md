WANNA WATCH

https://lovable.dev/projects/ce67d9bf-2d31-45d1-9e69-3b9e9c700e49

my notes/ prompts/ changes

I would like to create a movie reccomendation website. The website allows to show many different movie cards that can be filtered by year, director genre and ordered wither by imbd or rotten tomatoes score. You are able to add these films in a watched list and wannawatch, if the in the watxhed list you give a score from -3 to 3 (below zero means dislike, above means liked). Then based on an algorithm thay checks all the fils you watcha and scores yku are given a daily list of 10 recommendations
- The app should be called "wanna watch" and have an icon that evokes the name - "ww" probably is a poor idea, but concept should be watch and desire (i am thinking of eye, heart as icons but there may be easier icons that convey what i mean)
- the daily 10 should be presented as a tinder like card to scroll if wanting to skip or wanna watch (before the user takes action, there is a quick animarion appearing on the top of the card that shows "left arrow icon  with skip text" on the left top left of the card "right arrow animation" on the top right of the card. the animation appears only with the first card at every daily 10 review. Also make sure to add an overlay on the card when swiped left (skip - in gray) and when swiped right (a pinkish red), the overlay should cover the content of the card with aroun 80% opacity. Under the card thers is a text that says "already watched" when clicking on it, that movie is added in their watch list. When completeting the 10 wanna watch cards, an animation apears that says "rememebr to add more watched movies" to imporve reccomendations and they are then brought back to the main page.
- when clicking on "+ watched"  or "already watched" the card turns and shows a "score card view" that when clicking "done" will then add the wactehd card to the profile.
- when creating the account, the user brought through an onboarding where they can set up information on what type of genres they like, based on that info they are shown a carousel of cards for those genres (grid of 3 rows where on each row we have  4 cards) that the user can scroll through by dragging each row. they are prompted to add at least 10 watched movies to unlock the daily 10 "wana watch reccomendation". Once the user adds 10  when done an animation appears that says "you unlocked your daily wanna watch".ANIMATIONS SHOULD BE TEMU STYLE BUT FLAT/2d


_______


Lovable (doublecheck if correct)Core Features
1. Movie Catalog & Filtering (/)
    * Curated catalog of 42 films spanning 9 genres with genre-themed poster stills.
    * Live filtering by genre, release decade, and director.
    * Sorting by IMDb score, Rotten Tomatoes score, year, or title, plus instant keyword search.
2. 3D Card Flip & Sentiment Scoring (−3 to +3)
    * Every movie card supports two quick actions: saving to Wanna Watch or marking as + Watched.
    * Clicking "+ Watched" flips the card with a 3D animation to reveal a Score Card.
    * Ratings range from −3 to +3 (negative = dislike, positive = love, zero = neutral/skipped), featuring a dynamic color fill bar that reflects your sentiment before clicking "Done".
3. Genre Onboarding & Unlock Milestone (/onboarding)
    * Step 1: Pick favorite genres to focus your starting recommendations.
    * Step 2: Three draggable, touch-friendly carousel rows showing 4 cards each.
    * Step 3: A live progress counter asking for at least 10 watched films. Rating 10 movies triggers an unlock banner ("You unlocked your Daily Wanna Watch"), taking you straight into your personalized queue.
4. Tinder-Style Daily 10 Swipe Deck (/daily)
    * Generates exactly 10 film recommendations each day based on your watched ratings, affinity weighting (genres, directors, decades), and wishlist.
    * Swipe mechanics:
        * Left arrow ("Skip") with a gray tinted overlay.
        * Right arrow ("Wanna Watch") with a semi-transparent pink/red overlay.
        * Animated helper hints on the first card showing how to swipe.
        * "Already watched" button under the card to flip and score it on the fly.
        * An end-of-deck completion screen nudging you to add more watched titles to refine recommendations, before auto-returning to the home feed.
5. Split Collections (/lists)
    * Two side-by-side containers: Watched (showing your personal scores) on the left, and Wanna Watch on the right.
    * Bottom summary badges on each container highlighting your top genres, decades, and average taste profile.
6. Instant Frontend Demo Mode (/auth)
    * Zero-friction demo login stored locally in your browser's storage, allowing you to test the full onboarding, rating, and recommendation flow immediately.
______


