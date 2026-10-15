param(
    [string]$OutDir = (Join-Path $PSScriptRoot "fixtures/office")
)

$ErrorActionPreference = "Stop"
$Password = "Gizli-" + [char]0x015F + [char]0x011F + [char]0x0130 + "-2026"
$Marker = "TRNCConvert test " + [char]0x00C7 + [char]0x011E + [char]0x0130 + [char]0x00D6 + [char]0x015E + [char]0x00DC

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

function Release($obj) {
    if ($null -ne $obj) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj) }
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    foreach ($variant in @("plain", "enc")) {
        $doc = $word.Documents.Add()
        $doc.Content.Text = "$Marker - Word belgesi."
        $path = Join-Path $OutDir "$variant.docx"
        if (Test-Path $path) { Remove-Item $path }
        if ($variant -eq "enc") { $doc.SaveAs2($path, 12, $false, $Password) } else { $doc.SaveAs2($path, 12) }
        $doc.Close($false)
        Release $doc
    }
} finally { $word.Quit(); Release $word }

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    foreach ($variant in @("plain", "enc")) {
        $wb = $excel.Workbooks.Add()
        $ws = $wb.Worksheets.Item(1)
        $ws.Cells.Item(1, 1).Value2 = $Marker
        $ws.Cells.Item(2, 1).Value2 = 42
        $path = Join-Path $OutDir "$variant.xlsx"
        if (Test-Path $path) { Remove-Item $path }
        if ($variant -eq "enc") { $wb.SaveAs($path, 51, $Password) } else { $wb.SaveAs($path, 51) }
        $wb.Close($false)
        Release $ws; Release $wb
    }
} finally { $excel.Quit(); Release $excel }

$ppt = New-Object -ComObject PowerPoint.Application
try {
    foreach ($variant in @("plain", "enc")) {
        $pres = $ppt.Presentations.Add(0)
        $slide = $pres.Slides.Add(1, 1)
        $slide.Shapes.Item(1).TextFrame.TextRange.Text = $Marker
        $slide.Shapes.Item(2).TextFrame.TextRange.Text = "PowerPoint sunumu"
        if ($variant -eq "enc") { $pres.Password = $Password }
        $path = Join-Path $OutDir "$variant.pptx"
        if (Test-Path $path) { Remove-Item $path }
        $pres.SaveAs($path, 24)
        $pres.Close()
        Release $slide; Release $pres
    }
} finally { $ppt.Quit(); Release $ppt }

[System.IO.File]::WriteAllText((Join-Path $OutDir "README.txt"),
    "Bu dosyalar Microsoft Office ile tests/office-fixtures.ps1 betigiyle uretildi.`n" +
    "enc.* dosyalarinin sifresi: Gizli-<s-cedilla><g-breve><I-dot>-2026 (UTF-8: Gizli-" + [char]0x015F + [char]0x011F + [char]0x0130 + "-2026)`n" +
    "Icerikteki isaret metni: $Marker`n", [System.Text.UTF8Encoding]::new($false))

Get-ChildItem $OutDir | Select-Object Name, Length | Format-Table -AutoSize | Out-String
