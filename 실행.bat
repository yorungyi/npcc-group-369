@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo  노스팜CC 연단체 3·6·9 (내 PC에서 미리보기)
echo  ------------------------------------
echo  브라우저가 자동으로 열립니다. 종료하려면 Ctrl+C
echo.
start "" http://localhost:5179/
python -m http.server 5179
