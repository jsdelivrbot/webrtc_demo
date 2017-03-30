import ajax from './ajax';

function validatePass (rule, str, callback) {
    let result = str.match(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{7,}$/);
    if (!result) {
        callback(new Error('请输入7位以上数字字母混合密码'));
    } else {
        callback();
    }
}

function checkEmail(rule, str, callback) {
    return ajax({
        url: '/checkEmail',
        data: {
            email: str
        }
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

function checkUsername(rule, str, callback) {
    return ajax({
        url: '/checkUsername',
        data: {
            username: str
        }
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

module.exports = {
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