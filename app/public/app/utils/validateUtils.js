import ajax from './ajax';
import commonUtils from './commonUtils';

function validatePass (rule, str, callback) {
    let result = str.match(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{7,}$/);
    if (!result) {
        callback(new Error('请输入7位以上数字字母混合密码'));
    } else {
        callback();
    }
}

function checkEmail(rule, str, callback) {
    checkRemote('email', str, callback);
}

function checkUsername(rule, str, callback) {
    checkRemote('username', str, callback);
}

function checkRemote(key, value, callback) {
    let data = {
        [key]: value
    };
    ajax({
        url: '/check' + commonUtils.capitalize(key),
        data: data
    }).done(function(resp) {
        if (resp.status) {
            callback();
        } else {
            callback(new Error(resp.errorMsg));
        }
    }).fail(function(resp, st, msg) {
        callback(new Error(msg));
    });
}

export default {
    email: [
        { required: true, message: '请输入email', trigger: 'blur' },
        { type: 'email', message: '请输入有效email账户', trigger: 'blur,change' },
        { validate: checkEmail, trigger: 'blur,change' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { validate: validatePass, trigger: 'blur' }
    ],
    username: [
        { required: true, message: '请输入用户昵称', trigger: 'blur' },
        { validate: checkUsername, trigger: 'blur,change' }
    ]
};