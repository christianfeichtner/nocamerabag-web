-- Migration of existing blog comments for "The best camera apps for iPhone (2026 Edition)"
-- Target URL: https://nocamerabag.com/blog/recommended-camera-apps
-- Total comments: 33 (18 top-level, 15 replies)

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (1, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Andy', 'imported@nocamerabag.com', '127.0.0.1', 'I’m amazed no one has thanked you for this blog. I’m new to iPhone photography. I’ve read many reviews of the popular camera apps. When I note what Apple’s own camera/photo apps can do, I then ask myself what else do I need? I think you have done a great job narrowing down the field. I’m still not sure I even need a ProCamera type of app. Initially I thought definitely because I want control of the shutter speed and that 48mb jog. Maybe I still do but I wonder if that is just old school mentality. The hi speed burst mode may be all I need for capturing the moment. And how many high detail shots do I really need? 

Keep up these excellent and concise posts.', 'approved', '2023-09-30 20:53:35');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (2, 1, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris Feichtner', 'imported@nocamerabag.com', '127.0.0.1', 'Dear Andy,

Thanks for taking to write a comment. Great to read that you found this summary useful.', 'approved', '2023-10-01 08:32:52');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (3, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Lizzie', 'imported@nocamerabag.com', '127.0.0.1', 'Thank you! This is so useful. Downloading these apps now!', 'approved', '2023-10-18 21:56:05');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (4, 3, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'You''re welcome! Happy that you found this post useful.', 'approved', '2023-10-20 05:18:52');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (5, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Serge', 'imported@nocamerabag.com', '127.0.0.1', 'This is by far the most interesting review of camera apps I have come across.
Thank you for sharing this information 👍', 'approved', '2024-01-03 17:23:07');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (6, 5, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'You''re welcome, Serge.', 'approved', '2024-01-04 18:17:20');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (7, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Urban Girl 808', 'imported@nocamerabag.com', '127.0.0.1', 'Thanks for this! About to venture out on a big trip without the big camera for the first time, and this is extremely helpful! Much appreciated.', 'approved', '2024-02-09 19:56:22');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (8, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Omar Lagomarsino', 'imported@nocamerabag.com', '127.0.0.1', 'Hi, thanks for your article. It’s very interesting. I totally agree with your selection of ProCamera app for complete control and of ReeHeld to take long exposure shots without a trípode.
But for long exposure photography, Didn’t you test Even Longer app?
I think it’s far the best per example for star trails, the noise reduction algorithm is wonderful , elimination of meteors or planes if you want, the intervalometer it provides has exclusively functionality and can also be changed by the fly, etc
Thanks !
Best Regards', 'approved', '2024-02-18 22:59:52');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (9, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Katya', 'imported@nocamerabag.com', '127.0.0.1', 'This just saved me so much time. Thanks for the great review!', 'approved', '2024-03-08 12:51:58');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (10, 9, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Happy I could help.', 'approved', '2024-04-01 07:51:27');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (11, 7, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Glad you found it helpful. How was your trip?', 'approved', '2024-04-01 07:52:06');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (12, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Naomi Tsuino', 'imported@nocamerabag.com', '127.0.0.1', 'I need an apps fo social media and for live streaming', 'approved', '2024-06-04 12:20:32');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (13, 12, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'I''m afraid I can''t help you with that.', 'approved', '2024-06-06 19:51:14');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (14, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Michelle', 'imported@nocamerabag.com', '127.0.0.1', 'Thanks for this post! I teach a summer photography course and Camera+ Pro is no longer affordable for my students. Though I prefer the convenience of having many of these features in one app, Slow Shutter Cam and ProCamera are super easy to use and way more affordable.', 'approved', '2024-07-01 18:20:18');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (15, 14, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Hi Michelle,

you''re very welcome. If you want to show this comment to your students: Hi students; enjoy your photography course!', 'approved', '2024-07-02 11:46:50');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (16, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Luca', 'imported@nocamerabag.com', '127.0.0.1', 'Thank you for this review. I would like to try using the iPhone for night sky shooting, for this reason I need long exposure times, seconds up to minutes for my auto-tracking system, and RAW format for PC post processing, combined in a single app. Does ProCamera include a B mode?', 'approved', '2024-07-11 12:12:02');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (17, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Kenneth', 'imported@nocamerabag.com', '127.0.0.1', 'Can ProCamera support shutter speed longer than 10sec ? As i want to control it for taking milky way. Thanks', 'approved', '2024-07-13 10:26:20');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (18, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Paul', 'imported@nocamerabag.com', '127.0.0.1', 'Hi - thanks you for this valuable information. I''m wondering if you can help me - I''m looking for a camera app (still frame) that allows variable shutter speed. I use ProMovie for video recording and it allows this facility - I can set 1/75 second for recording off old crt monitors without bars. The camera apps I have found so far only allow fixed speeds - 1/30, 1/60, 1/80, etc... Do you know of anything that will enable a continuous variable shutter speed? Than you in advance. Paul', 'approved', '2024-08-23 22:11:56');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (19, 18, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Hi Paul,

thanks for your comment. The problem with "variable" shutter speed ist, that the shutter speed of the iPhone is limited by hardware (to the best of my knowledge to 1 second). If that is enough for you, you can use e.g. ProCamera App which allows you to set the shutter speed manually (with a max of 1 second). If you need a longer exposure, you have to turn to one of the long shutter camera apps. But as the shutter speed is limited by hardware, these long exposure apps basically capture multiple images or even a video and calculate a long exposure from that. So essentially, they''re simulating a longer shutter speed (that you can set freely).', 'approved', '2024-08-26 12:50:22');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (20, 17, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Unfortunately, no. The shutter speed of iPhone is limited by hardware (to the best of my knowledge, it''s 1 second). For longer shutter speeds, you need to turn to a dedicated long exposure camera app. They will simulate a longer shutter speed by capturing multiple images or even a video and then calculate a final image (emulating a longer shutter speed).', 'approved', '2024-08-26 12:52:15');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (21, 16, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Hi Luca, unfortunately, as the shutter speed of the iPhone is limited by hardware (to my best knowledge to 1 second) you''ll need a camera app simulating a long exposure (like slow Shutter Cam App).', 'approved', '2024-08-26 12:54:32');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (22, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Anais Harris', 'imported@nocamerabag.com', '127.0.0.1', 'Hi,
Thank you for this it is really helpful! I mostly take theatre photography so musicals etc where the lighting is tricky and people are moving around. What would you recommend I use for that? I need clear good quality photos of the performers. For reference I have an iPhone 16 pro max.
Thanks!', 'approved', '2024-10-24 18:24:15');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (23, 22, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Hi,

That’s tricky with iPhone, even with an iPhone 16. You need good light. Then I’d give ProCamera App a try as you can manually set the exposure time and ISO. You may want to try priority mode, setting the shutter speed as fast as possible. I’d also shoot in RAW, so you can brighten the image.', 'approved', '2024-10-25 08:13:57');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (24, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Derek', 'imported@nocamerabag.com', '127.0.0.1', 'Great article. I figured I’d chime in about the 1 second shutter speed limitation mentioned. I also thought this to be the case, however when shooting a night sky I discovered I was able to achieve upwards of 30 second exposures on my iPhone 15 Pro, using only the default Camera app.

To do this set your Camera app to ‘photo’… then make sure the moon/sun icon is enabled (upper left of camera app screen) & the ‘Raw Max’ icon is enabled (upper right of camera app screen). By default the shutter speed is 1-3 seconds, though if your environment is dark enough & requires more light, the camera app will automatically increase the exposure time (up to 30 seconds). 

But this only works if your phone is completely still (using a tripod or resting against a stationary object/surface). The minute the phone senses motion, the longer exposure time will revert back to a shorter one. When shooting the northern lights my phone would fluctuate between 10 & 40 second exposures, depending on how much ambient light there was. 

Hope this helps.', 'approved', '2024-12-04 01:44:12');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (25, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'phaul2001', 'imported@nocamerabag.com', '127.0.0.1', 'Hello, thank you for this very helpful blog. Before reeHeld I used Spectre (from the Halide guys) what has more or less the same functionality. But I find the results of reeHeld of better quality.

BR Thomas', 'approved', '2025-01-13 18:04:40');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (26, 24, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Hi Derek, you''re right. But the iPhone Camera App basically does the same thing as Slow Shutter Cam App does (it''s not "hardware" long exposure). However, Slow Shutter Cam App gives you a bit more control like ISO-Setting and bulb mode. That''s why I recommend it (over the built in night mode).', 'approved', '2025-01-14 08:57:57');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (27, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Wankja Ferguson', 'imported@nocamerabag.com', '127.0.0.1', 'Which app would be the best to get more optical zoom (IPhone 16 pro Max )', 'approved', '2025-01-19 09:57:49');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (28, 27, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'No app will bring you more optical zoom. The optical zoom is a built-in hardware. To get more optical zoom, you''ll need to use a third-party zoom lens like the one from Sandmarc.', 'approved', '2025-01-19 19:52:12');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (29, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Abe', 'imported@nocamerabag.com', '127.0.0.1', 'An alternative to reelheld is spectre ; it works handheld and uses AI too', 'approved', '2025-01-28 06:48:13');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (30, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Jim Wayda', 'imported@nocamerabag.com', '127.0.0.1', 'Thank you for an excellent article. I am hoping that you can shed some light on my problem. I use Photomatix for HDR processing and therefore I prefer to shoot HDR images by using AEB with 3, 5, or 7 shots. On a real DSLR, you set the aperture, ISO, and the middle shutter speed. The DSLR then shoots the bracket by varying the shutter speed. This is the correct way to shoot a bracket. The problem is that after market camera apps for the iPhone shoot brackets differently. They vary both the ISO and the shutter speed. When I go to process these brackets in Photomatix, the software complains and indicates that substandard results should be expected because the ISO is varying and needs to be held constant. I have discussed this with the creators Photomatix and they confirmed that the ISO needs to be held constant when shooting brackets. I have asked the creators of ProCamera to make this simple change, but can’t get them to commit to implementing it. I also tested the Moment Camera app and it also varies the ISO. Are you aware of any iPhone camera apps that can shoot brackets correctly like a DSLR by holding the ISO constant and only varying the shutter speed?

Thanks,
-jim', 'approved', '2025-02-01 04:24:40');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (31, 30, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'Hi Jim,

the Problem is the iPhone hardware. The shutter speed is limited to 1 second, and thus all camera apps use a different way (ISO) to produce the different exposures. I''m not aware of any camera app that uses the shutter speed like you mentioned.

Back in my good old days we used to take bracketed shots by varying the aperture.', 'approved', '2025-02-03 09:37:12');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (32, NULL, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Adam', 'imported@nocamerabag.com', '127.0.0.1', 'Thank You for this helping article. I will share my personal experience with you soon.', 'approved', '2025-04-21 16:29:34');

INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)
VALUES (33, 32, 'recommended-camera-apps', 'https://nocamerabag.com/blog/recommended-camera-apps', 'Chris F.', 'imported@nocamerabag.com', '127.0.0.1', 'You''re welcome, Adam.', 'approved', '2025-05-05 07:14:08');

