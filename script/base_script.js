/**
 * @author: WhiteWallTeam
 * @date: 2024.10.12
 * @description: 基本脚本
 */

function onSAuthLoginRequestEvent(body) {
    console.log(`Request ${body}`)
}

function onSAuthLoginResponseEvent(body) {
    console.log(`Response ${body}`)
}

function onSAuthJsonHookEvent(json) {
    console.log(`SAuthJson ${json}`)
    tryInitUser()
}

function onCallModuleEvent(args) {
    // console.log('CallModule',args)
}

function decodePartialUnicode(str) {
    return str.replace(/\\u([0-9A-Fa-f]{4})/g, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });
}

// Fetch data from a given URL with retry logic
async function fetchData(url, body = '', retries = 3, delay = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const data = await new Promise((resolve, reject) => {
                curl_post_game_api(url, body, (code, responseData) => {
                    if (code === 200) {
                        resolve(decodePartialUnicode(responseData));
                    } else {
                        reject(new Error(`API call failed. Code: ${code}`));
                    }
                });
            });

            // Parse JSON and check for errors
            const jsonData = JSON.parse(data);
            if (jsonData.code !== 0) {
                throw new Error(`API error. Code: ${jsonData.code}, Message: ${jsonData.message} ${jsonData.data}`);
            }
            return jsonData;
        } catch (error) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay)); // wait before retrying
            } else {
                throw error; // rethrow the error if no retries left
            }
        }
    }
}

// Main function to initialize user and handle API calls
async function tryInitUser() {
    try {
        // Fetch user data
        const userDataJson = await fetchData('https://g79obtcore.minecraft.cn:8443/pe-user-detail/get', '', 10);
        console.log(`User data: ${JSON.stringify(userDataJson.entity)}`);

        // Fetch daily sign state
        const dailySignStateJson = await fetchData('https://g79apigatewayobt.minecraft.cn/interconn/web/interactivity/daily-sign-state');
        console.log(`Daily sign state: ${dailySignStateJson.message}`);

        if (dailySignStateJson.entity.today_sign_status === false) {
            // Fetch daily reward
            try {
                const rewardJson = await fetchData('https://g79mclobt.minecraft.cn/interconn/web/interactivity/get-daily-reward');
                console.log(`Daily reward: ${rewardJson.message}`);
            } catch (error) {
                console.log(`Error: ${error.message}`);
            }
        }

        // Fetch weekly login activity info
        const infoJson = await fetchData('https://g79mclobt.minecraft.cn/interconn/web/weekly-login-activity/get-info');
        const {
            sign_reward: signRewards,
            total_sign: totalSign,
            weekly_reward_state: weeklyRewardState
        } = infoJson.entity;

        for (let i = 0; i < 7; i++) {
            const reward = signRewards[i];
            const sign = totalSign[i];
            switch (sign) {
                case 0:
                    console.log(`未开启 ${reward.nb} ${reward.rewardName} ${reward.reward_content}`);
                    break;
                case 1:
                    console.log(`已完成 ${reward.nb} ${reward.rewardName} ${reward.reward_content}`);
                    break;
                case 2:
                    console.log(`可完成 ${reward.nb} ${reward.rewardName} ${reward.reward_content}`);
                    const result = await fetchData('https://g79mclobt.minecraft.cn/interconn/web/weekly-login-activity/sign', JSON.stringify({"week_day": i}));
                    console.log(`签到结果: ${result.message}`);
                    break;
                default:
                    console.log(`未知状态 ${reward.nb} ${reward.rewardName} ${reward.reward_content}`);
            }
        }

        // Handle weekly login reward
        if (weeklyRewardState === 0) {
            console.log(`开启周登录奖励`);
            const weekendRewardResult = await fetchData('https://g79mclobt.minecraft.cn/interconn/web/weekly-login-activity/get-weekend-reward');
            console.log(`周登录奖励: ${weekendRewardResult.message}`);
        }

        // Fetch mall info
        const mallInfoJson = await fetchData('https://g79mclobt.minecraft.cn/interconn/web/direct-shopping-mall/info');
        for (const item of mallInfoJson.entity.shopping_list) {
            console.log(`商品 ${item.name} 价格 ${item.price} 库存 ${item.buy_limit} 已购 ${item.has_buy_count}`);

            if (item.price > 0) {
                // Skip items with positive price
                continue;
            }

            if (item.buy_limit - item.has_buy_count <= 0) {
                // Skip items where no purchases are allowed
                continue;
            }

            const quantityToBuy = item.buy_limit - item.has_buy_count;
            const result = await fetchData('https://g79mclobt.minecraft.cn/interconn/web/direct-shopping-mall/buy', JSON.stringify({
                "id": item.id,
                "buy_num": quantityToBuy
            }));
            console.log(`购买结果: ${result.message}`);
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}
