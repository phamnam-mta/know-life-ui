import React, {
  useState,
} from "react";


import {
  ErrorBoundary,
  SearchProvider,
  WithSearch,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

import buildRequest from "./buildRequest";
import runRequest from "./runRequest";
import applyDisjunctiveFaceting from "./applyDisjunctiveFaceting";
import buildState from "./buildState";

function buildFrom(current, resultsPerPage) {
  if (!current || !resultsPerPage) return;
  return (current - 1) * resultsPerPage;
}

const config = {
  debug: true,
  hasA11yNotifications: true,
  initialState: {
    resultsPerPage: 10
  },
  onResultClick: () => {
    /* Not implemented */
  },
  onAutocompleteResultClick: () => {
    /* Not implemented */
  },
  onAutocomplete: async ({ searchTerm }) => {
    const requestBody = buildRequest({ searchTerm });
    const json = await runRequest(requestBody);
    const state = buildState(json);
    return {
      autocompletedResults: state.results
    };
  },
  onSearch: async state => {
    const { current, searchTerm, resultsPerPage, sortField } = state;
    const from = buildFrom(current, resultsPerPage);
    const size = resultsPerPage;
    let search_method = sortField
    if(sortField === "") {
      search_method = "elastic"
    }
    // const requestBody = {
    //   "question": searchTerm,
    //   "page_size": size,
    //   "page_index": from,
    //   "search_method": search_method
    // };
    const requestBody = {
      "indicators": [
        { "id": 1, "test_name": searchTerm.split(":")[0], "result": searchTerm.split(":")[1], "unit": "mmol/L" }
      ]
    };
    // Note that this could be optimized by running all of these requests
    // at the same time. Kept simple here for clarity.
    const responseJson = await runRequest(requestBody, search_method);
    
    return buildState(responseJson);
  }
};

export default function App() {
  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => (
          <div className="App">
            <ErrorBoundary>
              <Layout
                header={
                  <SearchBox
                    // autocompleteMinimumCharacters={3}
                    // autocompleteResults={{
                    //   linkTarget: "_blank",
                    //   sectionTitle: "Results",
                    //   titleField: "title",
                    //   urlField: "nps_link",
                    //   shouldTrackClickThrough: true,
                    //   clickThroughTags: ["test"]
                    // }}
                    // autocompleteSuggestions={true}
                  />
                }
                sideContent={
                  <div>
                    <Sorting
                        label={"Sort by"}
                        sortOptions={[
                          {
                            name: "Entity Search",
                            value: "entity",
                            direction: ""
                          },
                          {
                            name: "Elastic Search",
                            value: "elastic",
                            direction: ""
                          },
                          {
                            name: "Semantic Search",
                            value: "semantic",
                            direction: ""
                          }
                        ]}
                      />
                    {/* {wasSearched && (
                      <Sorting
                        label={"Sort by"}
                        sortOptions={[
                          {
                            name: "Relevance",
                            value: "",
                            direction: ""
                          },
                          // {
                          //   name: "Question",
                          //   value: "question",
                          //   direction: "asc"
                          // }
                        ]}
                      />
                    )} */}
                    {/* <Facet
                      field="states"
                      label="States"
                      filterType="any"
                      isFilterable={true}
                    />
                    <Facet
                      field="world_heritage_site"
                      label="World Heritage Site?"
                    />
                    <Facet field="visitors" label="Visitors" filterType="any" />
                    <Facet
                      field="acres"
                      label="Acres"
                      view={SingleSelectFacet}
                    /> */}
                  </div>
                }
                bodyContent={
                  <Results
                    //titleField="question"
                    shouldTrackClickThrough={true}
                  />
                }
                // bodyContent={({ results }) => {
                //   return (
                //     <div>
                //       {results.map((result, index) => (
                //         <Result key={index.toString()}
                //           result={result}
                //           titleField="question"
                //         />
                //       ))}
                //     </div>
                //   );
                // }}
                bodyHeader={
                  <React.Fragment>
                    {wasSearched && <PagingInfo />}
                    {wasSearched && <ResultsPerPage />}
                  </React.Fragment>
                }
                bodyFooter={<Paging />}
              />
            </ErrorBoundary>
          </div>
        )}
      </WithSearch>
    </SearchProvider>
  );
}
