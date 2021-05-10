const searchApiURL = "https://www.omdbapi.com/?apikey=55d440b5&type=movie&s=";
const nominateBtnHTML = `<button class="btn btn-outline-dark btn-sm js-nominate">Nominate</button>`;
const disabledClassNominateBtnHTML = `<button class="btn btn-outline-dark btn-sm disabled js-nominate">Nominate</button>`;
const disabledAttrNominateBtnHTML = `<button class="btn btn-outline-dark btn-sm js-nominate" disabled="disabled">Nominate</button>`;
let nominatedList = [];
let isFinished = false;

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

function saveNomination() {
    const nominationsHTML = $("#nominations").html();
    Cookies.set("nominationHTML", nominationsHTML);
    Cookies.set("nominationList", nominatedList.join());
}

function removeNominated(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

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
        nominatedList.push(nominated.text().slice(0, -7));

        if (nominations.children().length === 5) {
            isFinished = true;
            $('#modal').modal('show');
            $(".js-nominate").attr("disabled", "disabled");
        }
        $(this).addClass("disabled");
    }
}

function getSearchResults() {
    const searchQuery = $(this).val();
    const searchResults = $("#search-results");
    searchResults.html("");
    $.ajax({
        url: `${searchApiURL}${searchQuery}`,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            console.log("success");
            if (data && data.Response === "False") {
                $("#results-for").html(`No results for "${searchQuery}"`);
            } else if (data && data.Response === "True" && data.Search) {
                $("#results-for").html(`Results for "${searchQuery}"`);
                for (const i in data.Search) {
                    const title = data.Search[i].Title;
                    const year = data.Search[i].Year;
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
    });
}

function main() {
    $("input[type=search]").on('input', getSearchResults);
    $(document).on("click", ".js-nominate", nominate);
    $(document).on("click", ".js-remove", removeNomination);

    $(window).on("unload", saveNomination);
    $(document).ready(loadNominations);
}

$(main)
