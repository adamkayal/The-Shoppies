// The search api URL, where the search query needs to be added
const searchApiURL = "https://www.omdbapi.com/?apikey=55d440b5&type=movie&s=";
// HTML for "Nominate" button
const nominateBtnHTML = `<button class="btn btn-outline-dark btn-sm js-nominate">Nominate</button>`;
// HTML for "Nominate" button with class disabled
const disabledClassNominateBtnHTML = `<button class="btn btn-outline-dark btn-sm disabled js-nominate">Nominate</button>`;
// HTML for "Nominate" button with attribute disabled
const disabledAttrNominateBtnHTML = `<button class="btn btn-outline-dark btn-sm js-nominate" disabled="disabled">Nominate</button>`;
// List of all movies nominated
let nominatedList = [];
// Is true when five movies are nominated and false if less than five are
let isFinished = false;

/** Loads the list of movies nominated from cookies and builds the Nomination block's list. */
function loadNominations() {
    $("input").val("");
    const nominationsHTML = Cookies.get("nominationHTML");
    const nominationList = Cookies.get("nominationList");
    if (nominationsHTML) {
        $("#nominations").html(nominationsHTML);
    }
    if (nominationList) {
        nominatedList = nominationList.split(",");
    }
}

/** Saves the list of movies nominated in cookies. */
function saveNomination() {
    const nominationsHTML = $("#nominations").html();
    Cookies.set("nominationHTML", nominationsHTML);
    Cookies.set("nominationList", nominatedList.join());
}

/**
 * Removes a value from a list if the list contains that value.
 * @param {array} arr - The array to be spliced
 * @param {string} value - The value to remove from the array
 */
function removeNominated(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

/** Removes a nomination from the Nomination block. */
function removeNomination() {
    const denominated = $(this)
        .parent()
        .text()
        .slice(0, -7);
    removeNominated(nominatedList, denominated);
    $(this)
        .parent()
        .remove();
    $("li:contains('" + denominated + "')")
        .children()
        .first()
        .removeClass("disabled");

    isFinished = false;
    $(".js-nominate").removeAttr("disabled");
}

/** Adds a nomination to the Nomination block. */
function nominate() {
    if (!$(this).hasClass("disabled")) {
        const nominations = $("#nominations");
        const nominated = $(this)
            .parent()
            .clone();
        nominated
            .children()
            .first()
            .html("Remove")
            .removeClass("js-nominate")
            .addClass("js-remove");
        nominations.append(nominated);
        // add that movie to the nominated list
        nominatedList.push(nominated.text().slice(0, -7));

        if (nominations.children().length === 5) {
            isFinished = true;
            $('#modal').modal('show');
            $(".js-nominate").attr("disabled", "disabled");
        }
        $(this).addClass("disabled");
    }
}

/** 
 * Builds the Result list block from the search results received from the OMDB api.
 * @param {object} data - The data received from the OMDB api.
 * @param {string} searchQuery - The search query entered by the user in the search bar.
 */
function buildSearchResults(data, searchQuery) {
    if (data && data.Response === "False") {
        $("#results-for").html(`No results for "${searchQuery}"`);
    } else if (data && data.Response === "True" && data.Search) {
        $("#results-for").html(`Results for "${searchQuery}"`);
        for (const i in data.Search) {
            const title = data.Search[i].Title;
            const year = data.Search[i].Year;
            // check if the movie is already nominated
            const isNominated = nominatedList.includes(`${title} (${year})`);
            let buttonHTML;
            if (isNominated) {
                buttonHTML = disabledClassNominateBtnHTML;
            } else if (isFinished) {
                buttonHTML = disabledAttrNominateBtnHTML;
            } else {
                buttonHTML = nominateBtnHTML;
            }
            const liHTML = `<li>${title} (${year}) ${buttonHTML}</li>`;
            searchResults.append(liHTML);
        }
    }
}

/** Gets search results from the OMDB api. */
function getSearchResults() {
    const searchQuery = $(this).val();
    const searchResults = $("#search-results");
    searchResults.html("");
    $.ajax({
        url: `${searchApiURL}${searchQuery}`,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            buildSearchResults(data, searchQuery);
        }
    });
}

/** Adds the necessary event listeners. */
function main() {
    $("input[type=search]").on('input', getSearchResults);
    $(document).on("click", ".js-nominate", nominate);
    $(document).on("click", ".js-remove", removeNomination);

    // saving cookies when tab closes
    $(window).on("unload", saveNomination);
    // loading nominations from cookies when DOM is loaded
    $(document).ready(loadNominations);
}

$(main)
