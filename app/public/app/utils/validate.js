import ajax from './ajax';

function validatePass (str) {
    return str.match(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{7,}$/);
}

function checkEmail() {
    return ajax({
        url: '/checkEmail'
    })
    .done(function() {})
    .fail(function() {});
}

module.exports = {
    email: [
        { required: true, message: '请输入email', trigger: 'blur' },
        { type: 'email', message: '请输入有效email账户', trigger: 'blur,change' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { validate: validatePass, message: '请输入7位以上数字字母混合密码', trigger: 'blur' }
    ],
    username: [
        { required: true, message: '请输入用户昵称', trigger: 'blur' }
    ]
};