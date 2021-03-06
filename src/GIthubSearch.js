import React, { useState, useEffect } from "react";
import formatDistance from "date-fns/formatDistance";

import { Loader } from "./Loader";
import "./css/loader.css";
import { Error } from "./Error";
import { TaskDescription } from "./TaskDescription";

const getQuery = () => {
  const sp = new URLSearchParams(window.location.search);
  return sp.get("query");
};

const getLastUpdated = date => {
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
      <TaskDescription
        title={"Github search"}
        desc={[
          "Enter a key word and search for popular repositories",
          "Page saves last searched keyword after reload"
        ]}
      />
      <form
        className="container--centered search-container"
        onSubmit={e => {
          e.preventDefault();
          updateQuery(state.input);
        }}
      >
        <div className="input-container">
          <input
            className="input"
            type="text"
            placeholder={"react"}
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
        <ul className="search__list">
          {state.list.map((elm, index) => {
            return (
              <li key={elm.id} className="user__container">
                <img
                  src={elm.owner.avatar_url}
                  alt=""
                  width={50}
                  height={50}
                  className="user__img"
                />
                <div className="user__info">
                  <a className="" href={elm.html_url}>
                    {elm.full_name}{" "}
                  </a>
                  <p className="user__last-updated">
                    last updated {getLastUpdated(elm.updated_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </form>
    </div>
  );
};
