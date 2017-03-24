import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';

Vue.use(Vuex);
var user = window.BACKEND_VAR.user;

// root state object.
// each Vuex instance is just a single state tree.
const state = {
    mySelf: (user.email ? user : ''),
    socket: null
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
    saveMySelf (state, data) {
        state.mySelf = data;
    },
    logout (state) {
        state.mySelf = '';
    },
    setCurrentRoom (state, data) {
        state.currentRoom = data;
    },
    saveSocket (state, socket) {
        if (!socket) {
            state.socket.close();
        }
        state.socket = socket;
    }
};

function loginOrSign (url, data, commit) {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: 'post',
            data: data
        }).done(function(resp) {
            let result = resp.result;
            if (!result || !result.loginstatus) {
                reject(result);
            } else {
                commit('saveMySelf', result);
                resolve(result);
            }
        }).fail(function(err, st, msg) {
            reject({
                errorCode: err.status,
                errorMsg: msg
            });
        });
    });
}

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
    login ({ commit, state }, formData) {
        return loginOrSign('/login', formData, commit);
    },
    signup ({ commit, state }, formData) {
        return loginOrSign('/signup', formData, commit);
    },
    getMySelf ({ commit, state }, update) {
        return new Promise((resolve, reject) => {
            if (state.mySelf && !update) {
                resolve(state.mySelf);
                return;
            }
            $.ajax('/getMySelf', {
                type: 'post'
            }).done(function(resp) {
                if (resp.status) {
                    if (resp.result && resp.result.loginstatus) {
                        commit('saveMySelf', resp.result);
                        resolve(resp.result);
                    } else {
                        reject(resp.result);
                    }
                } else {
                    reject(resp.result);
                }
            }).fail(function(err, st, msg) {
                reject({
                    errorCode: err.status,
                    errorMsg: msg
                });
            });
        });
    },
    logout ({ commit, state }) {
        commit('saveSocket', null);
        return new Promise((resolve, reject) => {
            $.ajax('/logout', {
                type: 'post'
            }).then(function(resp) {
                if (resp.status) {
                    commit('logout');
                    resolve();
                }
            });
        });
    },
    saveSocket ({ commit, state }, socket) {
        commit('saveSocket', socket);
    }
};

// getters are functions
const getters = {
    mySelf: state => state.mySelf,
    socket: state => state.socket
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
});
