import axios from "axios";
import { createWriteStream, mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types";
import { finished } from "stream";
import { promisify } from "util";
import { promises as fs } from "fs";

// export const startDownloadServer = () => {
const finishedPromise = promisify(finished);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//start file name //name_date_time_001
const downloadFileFromMediaUrl = async (
  url,
  folderPath,
  filePrefix,
  index,
  dateStr,
  timeStr,
) => {
  try {
    // Use current date/time if not provided
    const now = new Date();
    const safeDateStr =
      dateStr || now.toISOString().split("T")[0].replace(/-/g, ""); // e.g. 20250528
    const safeTimeStr =
      timeStr || now.toTimeString().split(" ")[0].replace(/:/g, ""); // e.g. 183459

    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    const contentType = response.headers["content-type"];
    let extension = mime.extension(contentType) || "bin";

    const filename = `${filePrefix}_${safeDateStr}_${safeTimeStr}_${String(index + 1).padStart(3, "0")}.${extension}`;
    const filePath = path.join(folderPath, filename);

    const writer = createWriteStream(filePath);
    response.data.pipe(writer);
    await finishedPromise(writer);

    return filename;
  } catch (error) {
    console.error(`❌ Error downloading media from ${url}:`, error.message);
    throw error;
  }
};

//end file name //name_date_time_001

const findStory = (obj) => {
  if (!obj || typeof obj !== "object") return null;
  if ("story" in obj && obj.story) return obj.story;

  for (const key in obj) {
    const result = findStory(obj[key]);
    if (result) return result;
  }
  return null;
};

////folder logic
const createFolderName = (name) => {
  // Get current date in YYYYMMDD format
  const currentDate = new Date();
  const dateString = currentDate.toISOString().split("T")[0].replace(/-/g, ""); // Get YYYYMMDD format

  // Get current time in HHMMSS format
  const timeString = currentDate.toTimeString().split(" ")[0].replace(/:/g, ""); // Get HHMMSS format

  // Create folder name as "Kitty_19042025_CurrentTime"
  return `${name}_${dateString}_${timeString}`;
};

//folder logic end

//working download code
const downloadMediaFromUrl = async (snapUrl, folderName) => {
  console.log(`Processing URL: ${snapUrl} for ${folderName}`);

  try {
    const response = await fetch(snapUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gm);
    if (!scriptMatches) throw new Error("No <script> tags found");

    let story = null;
    for (let script of scriptMatches) {
      try {
        const jsonText = script
          .replace(/<script[^>]*>/, "")
          .replace("</script>", "")
          .trim();
        if (jsonText.startsWith("{") || jsonText.startsWith("[")) {
          const parsed = JSON.parse(jsonText);
          story = findStory(parsed);
          if (story) break;
        }
      } catch (e) {}
    }

    if (!story || !story.snapList) {
      console.log(
        "🧠 Sample snap structure:",
        JSON.stringify(story.snapList[0], null, 2),
      );

      console.error(`❌ No story or snaps found in response from ${snapUrl}`);
      return;
    }

    console.log(
      `📸 Found ${story.snapList.length} snaps in story for ${folderName}`,
    );

    const folderPath = path.join(__dirname, "downloads", folderName);

    if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true });

    const mediaUrls = story.snapList
      .map((snap) => snap.snapUrls?.mediaUrl) // Updated to use snapUrls.mediaUrl
      .filter(Boolean); // Filter out any undefined or null URLs

    for (let i = 0; i < mediaUrls.length; i++) {
      const mediaUrl = mediaUrls[i];
      await downloadFileFromMediaUrl(mediaUrl, folderPath, folderName, i);
    }

    console.log(`✅ Finished downloading for ${folderName}`);
  } catch (err) {
    console.error(`Failed to download from ${snapUrl}:`, err);
  }
};

// Define your URLs here
const urls = [
  { name: "Priyanka p shetty", url: "https://www.snapchat.com/@pinku_2625" },
  { name: "Kitty", url: "https://www.snapchat.com/add/tapyyuwuu/" },
  { name: "BinduGowda", url: "https://www.snapchat.com/add/bindu_gowda7" },
  { name: "PinkyDevil", url: "https://www.snapchat.com/add/pinkydevil2021" },
  //    { name: "Pinky pricila", url: "https://www.snapchat.com/add/pinkycecilia" },
  { name: "Anushali", url: "https://www.snapchat.com/add/anshwolf" },
  { name: "Shana", url: "https://www.snapchat.com/add/shanaabanaana" },
  { name: "Anthara", url: "https://www.snapchat.com/add/anthra.u" },
  { name: "Kushi Anchor", url: "https://www.snapchat.com/add/khushkhushi777" },
  { name: "That Mallu Chick", url: "https://www.snapchat.com/add/that_malluchic" },
  { name: "Monisha PES", url: "https://www.snapchat.com/add/monisha_rao11" },
  //  { name: "Senorita Sara", url: "https://www.snapchat.com/add/senorita_sara8" },
  { name: "Shyni", url: "https://www.snapchat.com/add/shynu_30" },
  { name: "Sr Srivani ", url: "https://www.snapchat.com/add/sravani10086" },
  { name: "Elizabeth", url: "https://www.snapchat.com/add/elizabethlx_xl" },
  { name: "Rashri Barik Shreya", url: "https://www.snapchat.com/add/shreyaoffici385" },
  { name: "Disha Singh", url: "https://www.snapchat.com/add/dishaaaaaaa21" },
  { name: "Kushi Achar", url: "https://www.snapchat.com/add/kushiiachar" },
  { name: "Shreya Chadda", url: "https://www.snapchat.com/add/shreya_chadda" },
  //   { name: "Gima", url: "https://www.snapchat.com/add/gima_ashi" },
  { name: "Mahek", url: "https://www.snapchat.com/add/tbhmahek" },
  { name: "anushka_joshi", url: "https://www.snapchat.com/add/anushka_joshi90" },
  // { name: "Andrea Lopez", url: "https://www.snapchat.com/add/victoriandreaa" },
  //  { name: "Toeyrattanin", url: "https://www.snapchat.com/add/toeyrdamatcha" },
  { name: "Spoorthi Gopalakrishna", url: "https://www.snapchat.com/add/spo.orthig" },
  { name: "Shyamagini", url: "https://www.snapchat.com/add/syamangini1" },
  { name: "Sanobar Sameer", url: "https://www.snapchat.com/add/sanobarsamir" },
  { name: "Sagarika", url: "https://www.snapchat.com/add/moma_097" },
  { name: "Rathna ", url: "https://www.snapchat.com/add/rathna_r8816" },
  { name: "Soundarya", url: "https://www.snapchat.com/add/soundaryav09" },
  { name: "Chaitra ", url: "https://www.snapchat.com/add/chaitrar8" },
  { name: "Irol", url: "https://www.snapchat.com/add/irol_on" },
  { name: "Teju", url: "https://www.snapchat.com/add/teju_s2022138" },
  { name: "Sandhay Suresh", url: "https://www.snapchat.com/add/sandhyasures5210" },
  { name: "Lil Boss ii", url: "https://www.snapchat.com/add/skhushi491" },
  //  { name: "Manya Gowda", url: "https://www.snapchat.com/add/manya_sk20" },
  //   { name: "Sonia", url: "https://www.snapchat.com/add/sonia-sonuu" },
  { name: "TejaShree", url: "https://snapchat.com/t/wujH64KA" },
  //  { name: "Suhana Khan", url: "https://snapchat.com/t/pR8CBviY" },
  { name: "AsaFlower No Name", url: "https://www.snapchat.com/add/asaflower16" },
  { name: "Bhavana", url: "https://www.snapchat.com/add/bhavana291299" },
  { name: "sanvi shetty", url: "https://www.snapchat.com/@iamsanvishetty" },
  //   { name: "bittu", url: "https://www.snapchat.com/@bittumeena25029" },
  { name: "Triveni", url: "https://www.snapchat.com/@trivenitrippy" },
  { name: "Deepna Muthamma", url: "https://www.snapchat.com/@deepnaaa_rox" },
  { name: "Pooja Hegde", url: "https://www.snapchat.com/@poojaheggde" },
  { name: "Preethi", url: "https://www.snapchat.com/@preethipritz95" },
  { name: "Kruthi_prakash", url: "https://www.snapchat.com/@kruthiprakash25" },
  { name: "anujas_anu_official", url: "https://www.snapchat.com/@anujas_1435" },
  { name: "Shruti🇨🇦🇮🇳", url: "https://www.snapchat.com/@shruti_shru2107" },
  { name: "Meenakshi Lamani", url: "https://www.snapchat.com/@u8570351" },
  { name: "Arti Lawai", url: "https://www.snapchat.com/@artilawai" },
  { name: "blancheLisaa", url: "https://www.snapchat.com/@blanchelisaa" },
  { name: "Harshitha Harshi", url: "https://www.snapchat.com/@harshitha_h5228" },
  { name: "thejaswini rs shetty", url: "https://www.snapchat.com/@thejaswini_rs" },
  //  { name: "Arpita", url: "https://www.snapchat.com/@arpi_arpita29" },
  { name: "Deepika", url: "https://www.snapchat.com/@deepika.meh15" },
  { name: "Your Babygirl", url: "https://www.snapchat.com/@yourbabygir4451" },
  { name: "Diii", url: "https://www.snapchat.com/@dishaaaa_di" },
  { name: "Diya Keerthi Sv", url: "https://www.snapchat.com/@diyakeerthisv" },
  { name: "lakshmi talakeri", url: "https://www.snapchat.com/@lakshmitalakeri" },
  { name: "dayana gc", url: "https://www.snapchat.com/@dgc7350" },
  { name: "Roopa Roopa", url: "https://www.snapchat.com/@rooparoopa25687" },
  { name: "Priyanka", url: "https://www.snapchat.com/@ugh_piyu" },
  { name: "Dr Vimarsha", url: "https://www.snapchat.com/@dr_vimm" },
  { name: "Meghana Megha", url: "https://www.snapchat.com/@megha_manvi1110" },
  { name: "Neha", url: "https://www.snapchat.com/@neha_aa11" },
  { name: "Moutrisha", url: "https://www.snapchat.com/@moutrisha_saha" },
  { name: "Dichhiiii🧋🫧", url: "https://www.snapchat.com/@aishh.waryaaaaa" },
  { name: "AmmuGowda", url: "https://www.snapchat.com/@ammugowda121522" },
  { name: "Ketaki Vaze", url: "https://www.snapchat.com/@kvaze1133" },
  { name: "Genesis", url: "https://www.snapchat.com/@genesis_lop6065" },
  { name: "Anagha", url: "https://www.snapchat.com/@iamsowmya23" },
  { name: "Ananya Shivkumaar", url: "https://www.snapchat.com/@ananya.shiv" },
  { name: "Aptha gowda🦋", url: "https://www.snapchat.com/@aptha_gowda06" },
  { name: "Reethu Shetty", url: "https://www.snapchat.com/@reethu_1508" },
  { name: "Chandana.Gowda", url: "https://www.snapchat.com/@chandanasuri_16" },
  { name: "Delilah", url: "https://www.snapchat.com/@delilah245000" },
  { name: "$pøórthi Gôwdà", url: "https://www.snapchat.com/@spoorthi418" },
  { name: "Nandana Mohan", url: "https://www.snapchat.com/@nmohan_25" },
  { name: "Ramya_C _Haalmath_🔥", url: "https://www.snapchat.com/@ramyac_haalmath" },
  //   { name: "🐰jass07ss", url: "https://www.snapchat.com/@jass07ss" },
  { name: "Pranamya Devadiga", url: "https://www.snapchat.com/@pranamyaahh" },
  { name: "ly cute", url: "https://www.snapchat.com/@lycute2025" },
  { name: "Abhijna S Rao", url: "https://www.snapchat.com/@abhijna_srao20" },
  { name: "Harshu Gowda 🧚", url: "https://www.snapchat.com/@harshugowda9929" },
  { name: "Divya Rayappa", url: "https://www.snapchat.com/@divyarayappa" },
  { name: "Ron_muthumanira", url: "https://www.snapchat.com/@ronica_arun08" },
  { name: "prapthi <3", url: "https://www.snapchat.com/@yujinslwft11" },
  { name: "A N U 🤎", url: "https://www.snapchat.com/@ananyaah_9636" },
  { name: "Chinmaie_chondamma", url: "https://www.snapchat.com/@chinmaychinnu15" },
  { name: "Y.shu♡", url: "https://www.snapchat.com/@y.shnaviiiii" },
  { name: "BELLI_GOWDA🥀👰", url: "https://www.snapchat.com/@san_gowda15" },
  { name: "Chithrá Acharya", url: "https://www.snapchat.com/@chithra0411" },
  { name: "Kavya🩷🐥", url: "https://www.snapchat.com/@kxvyxsri" },
  { name: "Bhoomi🖤", url: "https://www.snapchat.com/@bhoomika_mr9632" },
  { name: "Deeps", url: "https://www.snapchat.com/@deep_s0808" },
  { name: "Sree", url: "https://www.snapchat.com/@ramya_shree3193" },
  { name: "Sony! 👁️", url: "https://www.snapchat.com/@sony_jasinthaa" },
  { name: "Hima Gangatkar❄️", url: "https://www.snapchat.com/@xmmu_0" },
  { name: "Sakshi Sunil 🙂‍↔️", url: "https://www.snapchat.com/@bcool0528" },
  { name: "spandanaa", url: "https://www.snapchat.com/@spandanaa_a" },
  { name: "Sowmya Baby", url: "https://www.snapchat.com/@sowmya143baby" },
  { name: "Sakshi❤️", url: "https://www.snapchat.com/@lahiri_15" },
  { name: "Archana Gowda", url: "https://www.snapchat.com/@acchu2141" },
  { name: "Pinkzz", url: "https://www.snapchat.com/@glistyglitter01" },
  //  { name: "Sonusrinivasgowda🌸", url: "https://www.snapchat.com/@sgowda8469" },
  { name: "Sandhya Sandhya", url: "https://www.snapchat.com/@sandhya_s234658" },
  { name: "❤️", url: "https://www.snapchat.com/@janvi_xi?" },
  { name: "Nivi ", url: "https://www.snapchat.com/@niviiiii_shetty" },
  { name: "𝐕𝑨𝑵𝐃𝐀𝐍𝐀 𝐆𝐎𝐖𝐃𝐀", url: "https://www.snapchat.com/@vandanagowda97" },
  { name: "Aadhya", url: "https://www.snapchat.com/@chrispa_pavi" },
  { name: "Kumuda N", url: "https://www.snapchat.com/@kumudan2902" },
  { name: "Aishu", url: "https://www.snapchat.com/@aysh230896" },
  { name: "Anuu Shetty 🌷", url: "https://www.snapchat.com/@anu5586" },
  { name: "Nidha Nidhu", url: "https://www.snapchat.com/@nidhanidhu46" },
  { name: "Shreya", url: "https://www.snapchat.com/@shreyaa_patil4" },
  { name: "Prarthana", url: "https://www.snapchat.com/@prarthana_84" },
  { name: "Shree🍉", url: "https://www.snapchat.com/@jzzy_07" },
  { name: "Rithika 🧿", url: "https://www.snapchat.com/@ft_rithikaaaa" },
  { name: "𝗣 𝗔 𝗟 🌷", url: "https://www.snapchat.com/@pallavie_07" },
  { name: "Nishchitha", url: "https://www.snapchat.com/@nishchitha-m" },
  { name: "Priyanka p shetty", url: "https://www.snapchat.com/@pinku_2625" },
  { name: "Dr Chaitu Rathod", url: "https://www.snapchat.com/@chaitu_jayanaik" },
  { name: "Raghavi Anand", url: "https://www.snapchat.com/@raghavi_ana2020" },
  //  { name: "C.m savithr Sachu", url: "https://www.snapchat.com/@cmsavithrsachu" },
  { name: "Sushma 💛", url: "https://www.snapchat.com/@sushmaaa_7" },
  { name: "Jelsa Philomina", url: "https://www.snapchat.com/@jelsaphilomina" },
  { name: "Manthana", url: "https://www.snapchat.com/@manthana7182" },
  { name: "dimplekudupaje", url: "https://www.snapchat.com/@dimplekudupaje" },
  { name: "Deepika❤️", url: "https://www.snapchat.com/@deepika.meh15" },
  { name: "Olivia Auraro 🎀", url: "https://www.snapchat.com/@sweetiesuchen22" },
  { name: "Nisarga Gowda", url: "https://www.snapchat.com/@nishhhh_gowda" },
  { name: "Sangeeta Shah", url: "https://www.snapchat.com/@sangeetasha6673" },
  { name: "Archana Bose🌸", url: "https://www.snapchat.com/@archana_bos3915" },
  { name: "Shreya", url: "https://www.snapchat.com/@its_shreya68" },
  { name: "snap_scenery", url: "https://www.snapchat.com/@ammu2ki" },
  { name: "Divya Ravi", url: "https://www.snapchat.com/@d_ravi8184" },
  { name: "Ankita", url: "https://www.snapchat.com/@snapwithankiii" },
  { name: "Anku ✨", url: "https://www.snapchat.com/@anaya_verma9" },
  { name: "HARSHITHA DHARANI", url: "https://www.snapchat.com/@harsz_04" },
  { name: "Anku ✨", url: "https://www.snapchat.com/@anaya_verma9" },
  { name: "Ramya Kattemane", url: "https://www.snapchat.com/@ramyagowda28095" },
  { name: "Thanviya Balraj🌸", url: "https://www.snapchat.com/@thanvibalraj" },
  //  { name: "Diva Flawless", url: "https://www.snapchat.com/@i.amdiva" },
  // { name: "Vidya Jain❣️", url: "https://www.snapchat.com/@vid1497" },
  { name: "Ahsaas Channa", url: "https://www.snapchat.com/@ahsaaschanna" },
  { name: "Akshita Sushant", url: "https://www.snapchat.com/@aksh22ita" },
  { name: "Aparna 🌸", url: "https://www.snapchat.com/@aparna_02" },
  { name: "Vaishu", url: "https://www.snapchat.com/@vaishu_sherlee" },
  { name: "Mad_world", url: "https://www.snapchat.com/@madihamaddy11" },
  { name: "Shwetha BR", url: "https://www.snapchat.com/@shwethabr23" },
  { name: "Srinishaa N", url: "https://www.snapchat.com/@srinishaa_n" },
  { name: "Vinz V", url: "https://www.snapchat.com/@imvinzv" },
  { name: "JASMITHA", url: "https://www.snapchat.com/@jasmitha612" },
  //    { name: "appy", url: "https://www.snapchat.com/@apurva_dhan23" },
  { name: "spandana✨", url: "https://www.snapchat.com/@spandana.06" },
  { name: "Srividya", url: "https://www.snapchat.com/@srividya201204" },
  { name: "Sheela Gowda🐾", url: "https://www.snapchat.com/@niveirah03" },
  { name: "Saranya Santhosh", url: "https://www.snapchat.com/@storiesofsaraa" },
  //      { name: "Sheela Gowda🐾", url: "https://www.snapchat.com/@niveirah03" },
  { name: "Aish", url: "https://www.snapchat.com/@aishnp" },
  { name: "Ankitha", url: "https://www.snapchat.com/@ankithakunjilan" },
  { name: "Clarita", url: "https://www.snapchat.com/@xo_clarita" },
  { name: "myna kalakanda", url: "https://www.snapchat.com/@mkalakanda2020" },
  { name: "Monalika🔱", url: "https://www.snapchat.com/@monalika8379" },
  { name: "Ranjini Bhat", url: "https://www.snapchat.com/@ranjinibhat23" },
  { name: "bluepillow057", url: "https://www.snapchat.com/@bluepillow057" },
  { name: "S@hàñà", url: "https://www.snapchat.com/@sahanavenkate19" },
  { name: "Srusti 🧿", url: "https://www.snapchat.com/@srusti_1226" },
  { name: "Larkspur", url: "https://www.snapchat.com/@lark_spur17" },
  { name: "Shweta Nayak", url: "https://www.snapchat.com/@shwetanayk573" },
  { name: "Smitha Shetty", url: "https://www.snapchat.com/@s_smitha6677" },
  { name: "Smitha Shetty", url: "https://www.snapchat.com/@s_smitha6677" },
  //    { name: "Kruthi Iyer", url: "https://www.snapchat.com/@kruthi_i19" },
  { name: "Yashmitha Sridhar Naidu", url: "https://www.snapchat.com/@yashmitha_23" },
  { name: "S@hàñà", url: "https://www.snapchat.com/@sahanavenkate19" },
  { name: "Dance Lover", url: "https://www.snapchat.com/@shilpas20233632" },
  { name: "Wanderlust", url: "https://www.snapchat.com/@rnavaratna1" },
  { name: "Bansika🦋", url: "https://www.snapchat.com/@bansikagriffin" },
  { name: "Greeshma", url: "https://www.snapchat.com/@greeshma_kk" },
  { name: "Sanjana Nayak", url: "https://www.snapchat.com/@sanju_nayak9572" },
  { name: "AN", url: "https://www.snapchat.com/@belle_an6" },
  { name: "Dr. Kavisha", url: "https://www.snapchat.com/@kavishasingh" },
  { name: "ਸ਼ੇਰNI 🐅", url: "https://www.snapchat.com/@itssherniiiii25" },
  { name: "Rohini Rohini", url: "https://www.snapchat.com/@rohini_r6270" },
  { name: "Kushika", url: "https://www.snapchat.com/@kushika_ma" },
  { name: "Bansika🦋", url: "https://www.snapchat.com/@bansikagriffin" },
  { name: "Meghana", url: "https://www.snapchat.com/@meghanashrini22" },
  { name: "Swathi Bhat", url: "https://www.snapchat.com/@swathibhattt" },
  { name: "Nischitha", url: "https://www.snapchat.com/@nischinicky7" },
  { name: "CVN💫", url: "https://www.snapchat.com/@chaithravnaik1" },
  { name: "Sangeetha gowda", url: "https://www.snapchat.com/@sangithagowda" },
  { name: "Ashwitha Mascarenhas", url: "https://www.snapchat.com/@ashwithamasca" },
  { name: "Aishwarya Bhat 🍂", url: "https://www.snapchat.com/@ibbani98" },
  { name: "Virgo Girl", url: "https://www.snapchat.com/@akshitha079" },
  { name: "Lavanya", url: "https://www.snapchat.com/@lavanyatatalavu" },
  { name: "Sanjana", url: "https://www.snapchat.com/@sanjana_n7589" },
  { name: "shilpa", url: "https://www.snapchat.com/@hegdegshilpa" },
  { name: "shy_lii", url: "https://www.snapchat.com/@shy_lii" },
  { name: "Dhruti 🖤", url: "https://www.snapchat.com/@cheeeckyyy" },
  { name: "Bhavana Gowda", url: "https://www.snapchat.com/@bhavana_gowda08" },
  { name: "Jhanu", url: "https://www.snapchat.com/@jhanu_ramesh1" },
  { name: "Sumeda", url: "https://www.snapchat.com/@sumedakharthal" },
  { name: "Keerthigowda Keerthigowda", url: "https://www.snapchat.com/@keerthigowdkee" },
  { name: "Anya poojari", url: "https://www.snapchat.com/@anya002233" },
  { name: "Bhavana Gowda", url: "https://www.snapchat.com/@bhavana_gowda08" },
  { name: "The Biker Chick", url: "https://www.snapchat.com/@yoginikg" },
  { name: "Aishu", url: "https://www.snapchat.com/@aishu_gowda6679" },
  { name: "Supriyarajashekhar", url: "https://www.snapchat.com/@suppi22564" },
  { name: "Varsha Kaveri", url: "https://www.snapchat.com/@varsha.kaveri17" },
  { name: "Anuhya ❤️‍🔥", url: "https://www.snapchat.com/@anuhya.sharma" },
  { name: "Varsha", url: "https://www.snapchat.com/@varshaj_gowda" },
  { name: "Nim👻", url: "https://www.snapchat.com/@nimsang20244538" },
  { name: "Yashmitha", url: "https://www.snapchat.com/@yashmitha_23" },
  { name: "Preeti Shetty", url: "https://www.snapchat.com/@preetishett2994" },
  { name: "Jovita💜", url: "https://www.snapchat.com/@jovi_fernandes" },
  { name: "Abhi💙", url: "https://www.snapchat.com/@mistroublemake" },
  { name: "Rakshitha", url: "https://www.snapchat.com/@rakshithax" },
  { name: "Shona Maria", url: "https://www.snapchat.com/@shona_maria08" },
  { name: "Raksha", url: "https://www.snapchat.com/@raksha_g22" },
  { name: "Shruthi Shetty", url: "https://www.snapchat.com/@s_shetty4778" },
  { name: "Sanya❤️\u200d🔥", url: "https://www.snapchat.com/@sssoujanyaaa15" },
  { name: "Amulya Dhilip", url: "https://www.snapchat.com/@amulyadhilip" },
  { name: "Pallavi!!!!", url: "https://www.snapchat.com/@lavilaughs" },
  { name: "Shroff Nayak", url: "https://www.snapchat.com/@shroffnayak20" },
  { name: "Nisha", url: "https://www.snapchat.com/@nishaaa2027" },
  { name: "Rakshitha_Gowda", url: "https://www.snapchat.com/@rakshgowda12" },
  { name: "Megha H S", url: "https://www.snapchat.com/@meghahs25" },
  { name: "Namratha Chinnu", url: "https://www.snapchat.com/@namratha_a02" },
  { name: "Aishwarya🐼💜", url: "https://www.snapchat.com/@aishofficial18" },
  { name: "nisarggaaaa____", url: "https://www.snapchat.com/@nisarggaaaa" },
  { name: "Hiya", url: "https://www.snapchat.com/@killingoons" },
  { name: "Shubha Hegde ❤️", url: "https://www.snapchat.com/@shubha_hegde08" },
  { name: "Seema Narayan", url: "https://www.snapchat.com/@seema_bn07" },
  { name: "kavya_anjana", url: "https://www.snapchat.com/@kavyaanjana26" },
  { name: "Akshitha Shettigar", url: "https://www.snapchat.com/@akxhii06" },
  { name: "Hema Acharya", url: "https://www.snapchat.com/@hema_acharya26" },
  { name: "Arpitha M", url: "https://www.snapchat.com/@arpitha_m9111" },
  { name: "Anuradha 😺", url: "https://www.snapchat.com/@anuradha3112" },
  { name: "♡", url: "https://www.snapchat.com/@babydoll_20078" },
  { name: "Sinchna", url: "https://www.snapchat.com/@sinchnads" },
  // { name: "", url: "" },
  // { name: "", url: "" },
  // { name: "", url: "" },
  // { name: "", url: "" },
  // { name: "", url: "" },
  // { name: "", url: "" },
  // { name: "", url: "" },

  // ... keep the ones you need
];

(async () => {
  for (const { name, url } of urls) {
    await downloadMediaFromUrl(url, name);
  }
  console.log("✅ All downloads completed!");
})();
