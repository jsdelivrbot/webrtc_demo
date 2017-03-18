import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';

Vue.use(Vuex);
var user = window.BACKEND_VAR.user;

// root state object.
// each Vuex instance is just a single state tree.
const state = {
    mySelf: (user.email ? user : ''),
    currentRoom: ''
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
    saveMySelf (state, data) {
        state.mySelf = {
            username: data.username,
            email: data.email,
            userid: data.userid
        };
    },
    logout (state) {
        state.mySelf = '';
    },
    setCurrentRoom (state, data) {
        state.currentRoom = data;
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
        return loginOrSign('./login', formData, commit);
    },
    signup ({ commit, state }, formData) {
        return loginOrSign('./signup', formData, commit);
    },
    getLoginStatus ({ commit, state }) {
        return new Promise((resolve, reject) => {
            if (state.mySelf) {
                resolve(state.mySelf);
                return;
            }
            $.ajax('./loginstatus', {
                type: 'get'
            }).done(function(resp) {
                if (resp.status) {
                    commit('saveMySelf', Object.assign({type: 'get'}, resp.result));
                    resolve(resp.result);
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
        return new Promise((resolve, reject) => {
            $.ajax('./logout', {
                type: 'post'
            }).then(function(resp) {
                if (resp.status) {
                    commit('logout');
                    resolve();
                }
            });
        });
    },
    setCurrentRoom ({ commit, state }, data) {
        commit('setCurrentRoom', data);
    }
};

// getters are functions
const getters = {
    mySelf: state => state.mySelf,
    currentRoom: state => state.currentRoom
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
});
