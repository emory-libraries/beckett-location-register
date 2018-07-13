# Beckett Location Register

This Beckett Location Register is for the Emory University Center for Digital Scholarship (ECDS) as an extension of their Beckett Letters project. The purpose of this register is to help users locate and otherwise lookup any relevant information about the letters written by Samuel Beckett through a searchable, filterable, and/or browseable user interface, which retrieves data from a `.csv` or `.xlsx` or from Google Sheets  via a REST API.

## Technical Specifications

### Technologies

The Beckett Location Register is a homegrown system built by Emory Libraries Library Technology and Digital Strategies division using custom front-end and back-end technologies. The source code for this system and its technologies have been made publicly accessible through [Emory Libraries Github](https://github.com/emory-libraries/beckett-location-register).

#### About the Back-End

The system deploys a PHP back-end designed to imitate REST API practices by reading and extracting data from a supplied database, then converting that data into a parsable JSON format that can then be used by the system's [front-end](#about-the-front-end). For the purpose of this project, the back-end was designed to be compatible with both Google Sheets data sets as well as local database files provided in a comma-delimited format, such as files with either a `.csv` or `.xlsx` extension, though the system has been setup to prefer a Google Sheets database over its latter alternative by default. However, if at anytime this preference needs to be changed, this can be done within the source code.

The back-end has also been made configurable through the use of JSON configuration files to ensure that the project has room to scale. For instance, the PHP-based REST API utilizes a JSON configuration file to architect and implement its various endpoints. This ensures that API endpoints can be added, changed, and/or removed with relative ease and also allows some manipulation over other built-in API configurations, such as search sensitivity and precision. Another JSON file has also been used to configure appropriate character transliterations, which is used for the API's searchable endpoints. 

#### About the Front-End

The system's front-end is built on top of the [Vue.js](https://vuejs.org) Javascript framework to help ease the handling of user interactions while also deploying the [jQuery](http://jquery.com/) JavaScript library to help with ensuring code conciseness and ease the handling of asynchronous JavaScript (AJAX) requests. More specifically, the front-end utilizes various HTML templates to render a user interface in the form of a single-page application while simultaneously interfacing with the system's [back-end](#about-the-back-end) via AJAX to retrieve, process, and display data from the supplied database. The front-end also utilizes the same JSON configuration files as the back-end in order to ensure that all data presented in the user interface is valid and consistent with the original data set.

Furthermore, other front-end specifications to note is that the system uses [Markdown](https://daringfireball.net/projects/markdown/) files to store and render the text displayed on its *Home* and *About* pages. This enables project maintainers to quickly edit and/or replace this content as needed without having to delve into the system's source code. Additionally, the system's front-end utilizes compiled SCSS to apply styling via CSS style sheets and also employs the [Font Awesome](https://fontawesome.com/) typeface for generating and displaying icons.

#### Notes for Developers

The source code for the [Beckett Location Register](https://github.com/emory-libraries/beckett-location-register) project can be found on [Emory Libraries' Github](https://github.com/emory-libraries). This project was built using development tools for dependency management and task automation, namely [npm](https://www.npmjs.com/), [Composer](https://getcomposer.org/), and [Grunt](https://gruntjs.com/).

### User Interface 

The Beckett Location Register provides a mobile-first website by which users can interact with the publicly available records within the Beckett Letters Location Register database. This user interface has been optimized for all devices, mobile through desktop, and is compatible with all modern web browsers. On older web browsers where compatibility issues may arise, users will be alerted of the potential compatibility issues and prompted to upgrade to a newer web browser before proceeding to use the site. 

Upon initially visiting the site, users will be immediately presented with the option to either search or browse through the Beckett Letters data set through a clear and prominent search box, which persists across all pages of the site. This search box allows users to perform a general search across all data fields or a narrow search on a target field in addition to providing users with the option to browse all data within the database. Additionally, users will also have the option to perform a Boolean search, which permits them to enter complex search queries that may utilize inclusion (`AND`), exclusion (`NOT`), and/or variation (`OR`) criteria.

After users perform a search or opt to browse, they will then be presented with a list of their search results or a full table of all records within the database. By default, these records will be sorted in ascending date order. From here, the user interface is then setup to allow users to further sort, page, and/or filter through the presented data. Users also have the option to change the quantity of records shown within the table at any given time or adjust the overall density of the contents within the table.

When sorting, users can expect their data to be sorted in ascending order first when they initially choose a field upon which to sort, then subsequent sorting on the same field will toggle between ascending and descending order. When filtering, users can also expect that all filters are inclusive, meaning that all specified filter criteria must be met by any given record in order for that record to be returned in the results list after filtering. Furthermore, once a filter has been applied, the user's available filter options will change based on the data returned within the result set. Thus, for best results, it's recommended that users apply only one filter at a time.

Finally, when users find a record of interest while in the list view, the user interface enables the user to review that record's detailed information by directly selecting the record's row within the results table. By doing so, users will then be taken the letter view, where they're able to read through the record's full information, including its recipient(s), physical description, postmark, actual and regularized addresses, repository, collection, and more.

A simple navigation bar has also been included at the top of the user interface, which allows users to quickly jump between the *Home* page, *About* page, and *List* screen, which also displays the full list of database results like the search box's browse button. At the bottom of the user interface is a simple footer which displays necessary copyright information. Lastly, the search box has been made persistent across all screens to enable users to easily initialize a new search or browse operation at any time and from anywhere within the site.

In addition to the user interface, the system's back-end also exposes a public REST API, which returns JSON output to web browser. By default, this API is configured to use the `api/` URI path from the Beckett Location Register's domain root and can be queried for raw data using any known endpoints and query parameters. Please note that this API is necessary as it is used by the system's front-end to consume data from the database, but it is not intended for use by end users. However, it may be of interest for use by the product owner.

### Maintenance

The Emory Libraries Library Technology and Digital Strategies division will be responsible for making any necessary bug fixes needed to maintain the Beckett Location Register in its current operable and working state. At this time, this scope of maintenance excludes enhancements and feature requests but does include any minor adjustments needed to ensure that the system's data is continuously present, consistently formatted, and appropriately represented based on the product owner's needs.

The product owner will be responsible for maintaining the database itself. This includes the process of adding, editing, and/or deleting data about the Beckett Letters from the preferred database. At this time, this database is in the form of a Google Sheet, which the Beckett Location Register has already been setup to use.
