import React, { useState, useEffect } from "react";
import formatDistance from "date-fns/formatDistance";

import { Loader } from "./Loader";
import "./css/loader.css";
import { Error } from "./Error";

const getQuery = () => {
  const sp = new URLSearchParams(window.location.search);
  return sp.get("query");
};

const getLastUpdated = date => {
  console.log(date);
  return formatDistance(new Date(date), new Date());
};

const getReposList = state => {
  const url = `https://api.github.com/search/repositories?q=${state.query}&sort=stars&order=desc`;
  return fetch(url).then(res => res.json());
};

export const GithubSearch = () => {
  const query = getQuery() || "";

  const [state, setState] = useState({
    input: query,
    query: query,
    list: [],
    isLoading: false,
    emptyResult: false,
    error: false
  });

  const updateInput = input => {
    return setState(s => {
      return { ...s, input: input };
    });
  };

  const updateQuery = input => {
    return setState(s => {
      return { ...s, query: input };
    });
  };

  useEffect(() => {
    if (state.query) {
      setState(s => ({ ...s, isLoading: true, emptyResult: false }));
      getReposList(state)
        .then(repos => {
          if (repos.items.length > 0) {
            setState(s => ({
              ...s,
              list: repos.items,
              isLoading: false
            }));
          } else {
            setState(s => ({
              ...s,
              list: repos.items,
              isLoading: false,
              emptyResult: true
            }));
          }
        })
        .catch(() => setState(s => ({ ...s, error: true, isLoading: false })));

      window.history.pushState(
        undefined,
        undefined,
        "/github-search?query=" + state.query
      );
    }
  }, [state.query]);

  return (
    <div className="container">
      <form
        className="container--centered search-container"
        onSubmit={e => {
          e.preventDefault();
          updateQuery(state.input);
        }}
      >
        <h2 className="title">Type in repo name and get a list of repos</h2>
        <div className="input-container">
          <input
            className="input"
            type="text"
            placeholder={"preact"}
            value={state.input}
            onChange={e => {
              updateInput(e.target.value);
            }}
          />
          <button className="black-button" onClick={() => {}} type="submit">
            Enter
          </button>
        </div>
        {state.error && <Error />}
        {state.emptyResult && (
          <h3 className="subheading">There are no repos to display</h3>
        )}
        {state.isLoading && <Loader size={"small"} />}
        <ul>
          {state.list.map((elm, index) => {
            console.log({ elm });

            return (
              <li key={elm.id}>
                <a className="" href={elm.html_url}>
                  {elm.full_name}
                  <p> last updated {getLastUpdated(elm.updated_at)}</p>
                </a>
              </li>

              // <p className="results__paragraph">{index + 1}.</p>
              // <p className="results__paragraph grey">{elm.owner.login}:</p>
              // <p className="results__paragraph results__paragraph--underlined">
              //   {elm.name}
              // </p>
            );
          })}
        </ul>
      </form>
    </div>
  );
};
