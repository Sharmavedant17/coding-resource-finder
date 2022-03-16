import { createContext, useEffect, useState } from "react";

const Context = createContext();

function ContextProvider({ children }) {
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("bookmarks");
    const initialValue = JSON.parse(saved);
    return initialValue || [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [pageTitle, setPageTitle] = useState("Coding Resource Finder");
  const [currentPage, setCurrentPage] = useState(1);
  const [renderedResources, setRenderedResources] = useState([]);
  const [resourceGroup, setResourceGroup] = useState([]);

  useEffect(() => {
    setResourceGroup(() => {
      return searchTerm.trim().length ? renderedResources : resources;
    });
    // eslint-disable-next-line
  }, [searchTerm]);

  useEffect(() => {
    getPageOfResources();
    setResourceGroup(renderedResources);
    // eslint-disable-next-line
  }, [currentPage]);

  useEffect(() => {
    getAllResources();
    // setRenderedResources(resources);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  async function getAllResources() {
    try {
      const response = await fetch(
        "https://coding-resource-finder-api.herokuapp.com/all"
      );
      const data = await response.json();
      const resources = await data.data;
      setResources(resources);
    } catch (error) {
      console.log(error);
    }
  }

  async function getPageOfResources() {
    try {
      const response = await fetch(
        `https://coding-resource-finder-api.herokuapp.com/all/${currentPage}`
      );
      const data = await response.json();
      const resourcesData = await data.data;
      setRenderedResources([...renderedResources, ...resourcesData]);
    } catch (error) {
      console.log(error);
    }
  }

  function addBookmark(resourceURL) {
    const newBookmark = resourceGroup.find(
      (resource) => resource.url === resourceURL
    );
    setBookmarks((prevBookmarks) => [...prevBookmarks, newBookmark]);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  function removeBookmark(bookmarkURL) {
    const newBookmarks = bookmarks.filter(
      (bookmark) => bookmark.url !== bookmarkURL
    );
    setBookmarks(newBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  function loadMoreResources() {
    setCurrentPage((prevPage) => {
      return (prevPage += 1);
    });
  }

  return (
    <Context.Provider
      value={{
        resources,
        setResources,
        getAllResources,
        renderedResources,
        resourceGroup,
        setRenderedResources,
        bookmarks,
        addBookmark,
        setBookmarks,
        removeBookmark,
        searchTerm,
        setSearchTerm,
        setPageTitle,
        loadMoreResources,
        setResourceGroup,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, ContextProvider };
