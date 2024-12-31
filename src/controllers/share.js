const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// 配置 AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;


const keepLatestFile = async (user_id) => {
    try {
        // 取得存儲桶中的所有檔案
        const params = { 
          Bucket: BUCKET_NAME,
          Prefix: `shared_htmls/${user_id}/`, 
        };
        const result = await s3.listObjectsV2(params).promise();

        // 確保至少有一個檔案
        if (result.Contents.length === 0) {
            console.log('No files found in the bucket.');
            return;
        }

        // 根據 LastModified 屬性排序檔案，並找到最新的檔案
        const sortedFiles = result.Contents.sort((a, b) => b.LastModified - a.LastModified);
        // 保留最新的檔案，刪除其他檔案
        const filesToDelete = sortedFiles.slice(1); // 切片，保留最新檔案，刪除其餘檔案

        if (filesToDelete.length > 0) {
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: filesToDelete.map(file => ({ Key: file.Key }))
                }
            };
            await s3.deleteObjects(deleteParams).promise();
            console.log(`Deleted ${filesToDelete.length} old files.`);
        } else {
            console.log('No old files to delete.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const shareHtml = async (req, res) => {
    const { html } = req.body;
    if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
    }

    const { user_id } = req.user;

    const fileName = `${uuidv4()}.html`;
    const params = {
        Bucket: BUCKET_NAME,
        Key: `shared_htmls/${user_id}/${fileName}`,  // 使用資料夾結構
        Body: html,
        ContentType: 'text/html',
        // ACL: 'public-read', //需要透過aws網頁console設定
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        const originalUrl=uploadResult.Location
        // 使用 URL 解析
        let urlObj = new URL(originalUrl);
        // 移除前綴的域名部分，僅保留路徑
        let newUrl = 'https:/' + urlObj.pathname;
        res.json({ url: newUrl });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload HTML' });
    }
    keepLatestFile(user_id)
};

// const viewHtml = async (req, res) => {
//     const { id } = req.params;
//     const params = {
//         Bucket: BUCKET_NAME,
//         Key: `${id}.html`,
//     }

//     try {
//         const data = await s3.getObject(params).promise();
//         res.setHeader('Content-Type', 'text/html');
//         res.send(data.Body.toString());
//     } catch (error) {
//         console.error('S3 View Error:', error);
//         res.status(404).json({ error: 'HTML not found' });
//     }
// };

const deleteHtml = async (req, res) => {
    const { path } = req.body;
    const params = {
        Bucket: BUCKET_NAME,
        Key: path
    };
    console.log(path)

    try {
        await s3.deleteObject(params).promise();
        res.json({ message: 'HTML deleted successfully' });
    } catch (error) {
        console.error('S3 Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete HTML' });
    }
};

module.exports = {
    shareHtml,
    // viewHtml,
    deleteHtml,
};
