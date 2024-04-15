const Search = () => {
    // The component returns JSX to be rendered.
    return (
        <header>
            <h2 className="header__title">Browse it. Like it. Invest in it.</h2>
            <input
                type="text"
                className="header__search"
                placeholder="Enter an address, neighborhood, city, or ZIP code"
            />
        </header>
    );
}

// Exporting the Search component so it can be imported and used in other parts of the application.
export default Search;