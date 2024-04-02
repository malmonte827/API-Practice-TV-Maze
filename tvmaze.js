"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
const altImage = "https://tinyurl.com/tv-missing";

async function getShowsByTerm(term) {
    // ADD: Remove placeholder & make request to TVMaze search shows API.
    const res = await axios.get(
        "https://api.tvmaze.com/search/shows?q=:query",
        {
            params: {
                q: term,
            },
        }
    );
    return res.data.map((result) => {
        return {
            id: result.show.id,
            name: result.show.name,
            image: result.show.image ? result.show.image.medium : altImage,
            summary: result.show.summary,
            premiered: result.show.premiered
        };
    });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
    $showsList.empty();

    for (let show of shows) {
        const $show = $(
            `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name} (${show.premiered[0]}${show.premiered[1]}${show.premiered[2]}${show.premiered[3]})</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
        );

        $showsList.append($show);
    }

}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
    const term = $("#searchForm-term").val();
    const shows = await getShowsByTerm(term);

    $episodesArea.hide();
    populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
    evt.preventDefault();
    await searchForShowAndDisplay();
});

// Given a show ID, get from API and return array of episodes:

async function getEpisodesOfShow(id) {
    const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

    return res.data.map((result) => {
        return {
            id: result.id,
            name: result.name,
            season: result.season,
            number: result.number,
        };
    });
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
    $episodesList.empty();
    for (let episode of episodes) {
        const $episode = $(`
    <li>S${episode.season}E${episode.number} - ${episode.name}</li>`);

        $episodesList.append($episode);
    }
    $episodesArea.show();
}



async function getEpisodesAndDisplay(evt) {
 
  const showId = $(evt.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);