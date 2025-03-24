#!/usr/bin/env bash
set -o errexit; set -o errtrace; set -o pipefail # Exit on errors

if [[ ! -f ./Encryptor ]]; then
    echo "Binary file ./Encryptor must be on $PWD and executable."
    exit 1
fi
if [[ $# != 1 ]]; then
    echo "Usage: ./encrypt_all_scripts.sh THE_KEY"
    echo
    echo "Warning, this will encrypt any javascript inside any subdirectory!"
    echo "BE CAREFUL WHERE YOU RUN THIS FROM!!!!!!!!!"
    exit 1
else
    KEY="$1"
fi



# Enables the ** glob (WATCH OUT!)
# TODO: remove this pls
shopt -s globstar

# Removes any null character from any javascript file
# inside any subdirectory from $PWD and beyond
# TODO: make a find function with directory depth limit
sed 's/\x00//g' -i **/**.js


gio trash ./encrypted_payloads || rm -r ./encrypted_payloads || true
mkdir -p ./encrypted_payloads

# Loops through all js, adds a NULL byte at the end, then encrypts it.
for unciphered_script in **/*.js; do
    _tmp_script=$(mktemp)
    cp "$unciphered_script" "$_tmp_script"
    # adds the null byte
    echo -en '\x00' >> "$unciphered_script"

    # encrypts
    ./Encryptor "$unciphered_script" "$KEY"

    # if all good and no errrs:
    if [[ $? == 0 ]]; then
        # populates a dirty xml file
        basename=$(basename "$unciphered_script")
        echo "<integer name=\"${basename%%.js}\">$(cat "$unciphered_script" | wc -c)</integer>" >> ./encrypted_payloads/integers.xml

        # copies over the encrypted script
        cp "$unciphered_script" "./encrypted_payloads/${basename%%.js}"

        # restores the original file
        cp "$_tmp_script" "$unciphered_script"
    fi
done

# echo 'To restore, git reset --hard.'